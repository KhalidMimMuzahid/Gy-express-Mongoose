const { validationResult } = require("express-validator");
const generateRandomString = require("../../config/generateRandomId");
const getIstTime = require("../../config/getTime");
const User = require("../../models/auth.model");
const { PackageRoi } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const Withdraw = require("../../models/withdraw.model");
const ValidationErrorMsg = require("../../helpers/ValidationErrorMsg");
const ManageAmount = require("../../models/manageAmount.model");

// Withdraw
const withdrawAmount = async (req, res) => {
  const error = validationResult(req).formatWith(ValidationErrorMsg);
  if (!error.isEmpty()) {
    let msg;
    Object.keys(req.body).map((d) => {
      if (error.mapped()[d] !== undefined) {
        msg = error.mapped()[d];
      }
    });
    if (msg !== undefined) {
      return res.status(400).json({
        message: msg,
      });
    }
  }
  try {
    const { amount, accountNumber, withdrawType } = req.body;
    const userId = req.auth;
    const user = await User.findOne({ userId });
    const wallet = await Wallet.findOne({ userId });
    const manageAmount = await ManageAmount.find({});

    if (!user?.isActive) {
      return res.status(400).json({ message: "You are an inactive user" });
    }

    if (Number(amount) >= manageAmount[0]?.minimumWithdrawAmount) {
      if (withdrawType === "investment") {
        if (wallet.investmentAmount >= Number(amount)) {
          const amountAfterCharge =
            Number(amount) -
            (Number(amount) / 100) * manageAmount[0]?.withdrawPercentage;
          const newData = {
            userId,
            fullName: user.fullName,
            sponsorId: user.sponsorId,
            sponsorName: user.sponsorName,
            requestAmount: Number(amount),
            withdrawCharge: manageAmount[0]?.withdrawPercentage,
            amountAfterCharge:
              Number(amount) -
              (Number(amount) / 100) * manageAmount[0]?.withdrawPercentage,
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
          const update = { $inc: { selfInvestment: -Number(amount) } };
          const options = { new: true };
          await Wallet.findOneAndUpdate(filter, update, options);
          await PackageRoi.findOneAndUpdate(
            { userId },
            {
              $inc: { currentPackage: -Number(amount) },
            }
          );
          await User.findOneAndUpdate(
            { userId },
            {
              $inc: {
                "packageInfo.amount": -Number(amount),
              },
            }
          );
          // if (investmentWallet.investmentAmount < 50) {
          //   await User.findOneAndUpdate(
          //     { userId },
          //     { $set: { isActive: false, "packageInfo.amount": 0 } }
          //   );
          //   await PackageRoi.findOneAndUpdate(
          //     { userId },
          //     { $set: { isActive: false } }
          //   );
          // }
          return res
            .status(200)
            .json({ message: "Investment withdrawal successful" });
        } else {
          return res.status(400).json({ message: "Insufficient Balance" });
        }
      } else if (withdrawType === "profit") {
        if (wallet.activeIncome >= Number(amount)) {
          const amountAfterCharge =
            Number(amount) -
            (Number(amount) / 100) * manageAmount[0]?.withdrawPercentage;
          const newData = {
            userId,
            fullName: user.fullName,
            sponsorId: user.sponsorId,
            sponsorName: user.sponsorName,
            requestAmount: Number(amount),
            withdrawCharge: manageAmount[0]?.withdrawPercentage,
            amountAfterCharge:
              Number(amount) -
              (Number(amount) / 100) * manageAmount[0]?.withdrawPercentage,
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
          const update = { $inc: { withdrawalBallance: -Number(amount) } };
          const options = { new: true };
          await Wallet.findOneAndUpdate(filter, update, options);

          return res
            .status(200)
            .json({ message: "Profit withdrawal successful" });
        } else {
          return res.status(400).json({ message: "Insufficient Balance" });
        }
      }
    } else {
      return res.status(400).json({
        message: `Minimum withdrawal amount is ₹${manageAmount[0]?.minimumWithdrawAmount}`,
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
