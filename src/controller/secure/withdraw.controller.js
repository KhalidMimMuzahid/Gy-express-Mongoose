const { validationResult } = require("express-validator");
const generateRandomString = require("../../config/generateRandomId");
const getIstTime = require("../../config/getTime");
const User = require("../../models/auth.model");
const { PackageRoi } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const Withdraw = require("../../models/withdraw.model");
const ValidationErrorMsg = require("../../helpers/ValidationErrorMsg");

// Withdraw
const withdrawAmount = async (req, res) => {
  try {
    const { amount, accountNumber, withdrawType } = req.body;
    const userId = req.auth;
    const user = await User.findOne({ userId });
    const wallet = await Wallet.findOne({ userId });

    if (!user?.isActive) {
      return res.status(400).json({ message: "You are an inactive user" });
    }

    if (Number(amount) >= 500) {
      // Check for the minimum withdrawal amount
      // const updateFields = {};
      // const newData = {
      //   userId,
      //   fullName: user.fullName,
      //   sponsorId: user.sponsorId,
      //   sponsorName: user.sponsorName,
      //   requestAmount: Number(amount),
      //   withdrawCharge: 5,
      //   amountAfterCharge: Number(amount) - (Number(amount) / 100) * 5,
      //   currentAmount: withdrawType === "profit" ? wallet.activeIncome - Number(amount) : 0,
      //   accountNumber,
      //   status: "pending",
      //   transactionId: generateRandomString(),
      //   transactionHash: "",
      //   withdrawType,
      //   date: new Date(getIstTime().date).toDateString(),
      //   time: getIstTime().time,
      // };

      if (withdrawType === "investment") {
        console.log("amount", wallet.investmentAmount);
        if (wallet.investmentAmount >= Number(amount)) {
          console.log("ali");
          const amountAfterCharge = Number(amount) - (Number(amount) / 100) * 5;
          const newData = {
            userId,
            fullName: user.fullName,
            sponsorId: user.sponsorId,
            sponsorName: user.sponsorName,
            requestAmount: Number(amount),
            withdrawCharge: 5,
            amountAfterCharge: Number(amount) - (Number(amount) / 100) * 5,
            chargeAmount: Number(amount) - amountAfterCharge,
            currentAmount: wallet.investmentAmount - Number(amount),
            accountNumber,
            status: "pending",
            transactionId: generateRandomString(),
            withdrawType,
            date: new Date(getIstTime().date).toDateString(),
            time: getIstTime().time,
          };
          await Withdraw.create(newData);
          const filter = { userId: userId };
          const update = { $inc: { investmentAmount: -Number(amount) } };
          const options = { new: true };
          const investmentWallet = await Wallet.findOneAndUpdate(
            filter,
            update,
            options
          );

          if (investmentWallet.investmentAmount > 500) {
            await User.findOneAndUpdate(
              { userId },
              { $set: { isActive: false, "packageInfo.amount": 0 } }
            );
            await PackageRoi.findOneAndUpdate(
              { userId },
              { $set: { isActive: false } }
            );
          }
          return res
            .status(200)
            .json({ message: "Investment withdrawal successful" });
        } else {
          return res.status(400).json({ message: "Insufficient Balance" });
        }
      } else if (withdrawType === "profit") {
        if (wallet.activeIncome >= Number(amount)) {
          const amountAfterCharge = Number(amount) - (Number(amount) / 100) * 5;
          const newData = {
            userId,
            fullName: user.fullName,
            sponsorId: user.sponsorId,
            sponsorName: user.sponsorName,
            requestAmount: Number(amount),
            withdrawCharge: 5,
            amountAfterCharge: Number(amount) - (Number(amount) / 100) * 5,
            chargeAmount: Number(amount) - amountAfterCharge,
            currentAmount: wallet.activeIncome - Number(amount),
            accountNumber,
            status: "pending",
            transactionId: generateRandomString(),
            withdrawType,
            date: new Date(getIstTime().date).toDateString(),
            time: getIstTime().time,
          };
          await Withdraw.create(newData);
          const filter = { userId: userId };
          const update = { $inc: { activeIncome: -Number(amount) } };
          const options = { new: true };
          const investmentWallet = await Wallet.findOneAndUpdate(
            filter,
            update,
            options
          );

          return res
            .status(200)
            .json({ message: "Profit withdrawal successful" });
        } else {
          return res.status(400).json({ message: "Insufficient Balance" });
        }
      }
    } else {
      return res.status(400).json({
        message: "Minimum withdrawal amount is ₹500",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// get withdraw history
const withdrawHistory = async (req, res) => {
  try {
    const userId = req.auth;
    if (!userId) {
      return res.status(400).json({ message: "User Id is required" });
    }
    const withdrawInfo = await Withdraw.find({ userId }).sort({
      createdAt: -1,
      date: -1,
    });

    if (withdrawInfo.length > 0) {
      return res.status(200).json({ data: withdrawInfo });
    } else {
      return res.status(400).json({
        message: "There is no withdraw history",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = { withdrawAmount, withdrawHistory };
