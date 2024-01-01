const getIstTime = require("../../config/getTime");
const User = require("../../models/auth.model");
const { PackageBuyInfo, PackageRoi } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");

const createTopupController = async (req, res) => {
  try {
    let { packageAmount } = req.body;
    if (!packageAmount) {
      return res.status(400).json({ message: "Package amount is required" });
    }
    if (packageAmount < 10) {
      return res.status(400).json({ message: "Minimum amount is ₹10" });
    }

    if (!req.auth) {
      return res.status(400).json({ message: "User Id is required" });
    }

    // Extracting the balance of user
    const { depositBalance = 0, activeIncome = 0 } = await Wallet.findOne({
      userId: req.auth,
    });
    if (depositBalance + activeIncome < packageAmount) {
      return res.status(409).json({ message: "Insufficient balance!" });
    }
    const startDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    startDate.setDate(startDate.getDate() + 1);
    // Find existing package info
    const extPackageBuyInfo = await PackageBuyInfo.findOne({
      userId: req.auth,
    }).sort({ createdAt: -1 });
    // Find user
    const currentUser = await User.findOne({ userId: req.auth });
    // Deduct amount to wallet
    depositBalance >= packageAmount
      ? await Wallet.findOneAndUpdate(
          { userId: req.auth },
          {
            $inc: {
              depositBalance: -packageAmount,
              selfInvestment: +packageAmount,
            },
          }
        )
      : await Wallet.findOneAndUpdate(
          { userId: req.auth },
          {
            $set: {
              depositBalance: 0,
              withdrawalBallance:
                activeIncome - (packageAmount - depositBalance),
            },
            $inc: {
              selfInvestment: +packageAmount,
            },
          }
        );

    // Create ROI instance
    if (!extPackageBuyInfo) {
      await PackageRoi.create({
        email: currentUser.email,
        userId: currentUser.userId,
        fullName: currentUser.fullName,
        packageId:
          Date.now().toString(36) + Math.random().toString(36).substring(2),
        currentPackage: packageAmount,
        sponsorId: currentUser.sponsorId,
        isActive: true,
        incomeDay: 0,
        totalReturnedAmount: 0,
        startDate: startDate.toDateString(),
        history: [],
      });
      // Create package buying info
      await PackageBuyInfo.create({
        userId: currentUser.userId,
        userFullName: currentUser.fullName,
        sponsorId: currentUser.sponsorId,
        sponsorName: currentUser.sponsorName,
        packageInfo: {
          amount: packageAmount,
          date: new Date(getIstTime().date).toDateString(),
          time: getIstTime().time,
        },
        packageType: "Buy",
      });
      // Get Current user
      await User.findOneAndUpdate(
        { userId: req.auth },
        {
          $set: {
            isActive: true,
            activationDate: new Date(getIstTime().date).toDateString(),
            packageInfo: {
              amount: +packageAmount,
            },
          },
        },

        { new: true }
      );
    } else {
      await PackageRoi.findOneAndUpdate(
        { userId: req.auth },
        {
          $set: {
            isActive: true,
          },
          $inc: {
            currentPackage: +packageAmount,
          },
          $push: {
            previousPackage: {
              amount: extPackageBuyInfo?.packageInfo?.amount,
              startDate: extPackageBuyInfo?.packageInfo?.date,
              endDate: new Date(getIstTime().date).toDateString(),
            },
          },
        }
      );
      // Create package buying info
      await PackageBuyInfo.create({
        userId: currentUser.userId,
        userFullName: currentUser.fullName,
        sponsorId: currentUser.sponsorId,
        sponsorName: currentUser.sponsorName,
        packageInfo: {
          amount: packageAmount,
          date: new Date(getIstTime().date).toDateString(),
          time: getIstTime().time,
        },
        packageType: "Upgrade",
      });
      // Get Current user
      await User.findOneAndUpdate(
        { userId: currentUser.userId },
        {
          $set: {
            isActive: true,
          },
          $inc: {
            "packageInfo.amount": +packageAmount,
          },
        },
        { new: true }
      );
    }
    return res.status(201).json({ message: "Topup successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// Get topup history
const getTopupHistoryController = async (req, res) => {
  try {
    const history = await PackageBuyInfo.find({ userId: req.auth }).sort({
      createdAt: -1,
    });
    if (history.length > 0) {
      return res.status(200).json({ data: history });
    } else {
      return res.status(400).json({ message: "There is no topup history" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
module.exports = {
  createTopupController,
  getTopupHistoryController,
};
