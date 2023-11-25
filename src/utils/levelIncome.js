const User = require("../models/auth.model");
const { PackageBuyInfo } = require("../models/topup.model");
const getIstTime = require("../config/getTime");
const LevelIncome = require("../models/levelIncome.model");
const generateString = require("../config/generateRandomString");
const Wallet = require("../models/wallet.model");
const Level = require("../models/level.model");

const levelIncome = async (ext, roiPerDayCommissionAmount) => {
  try {
    const levels = await Level.find({ "level.userId": ext?.userId });
    for (const lvl of levels) {
      // find distributor level user level
      const distributorLvl = lvl?.level?.filter(
        (d) => d?.userId === ext?.userId
      );
      // find upline user
      const lvlUser = await User.findOne({ userId: lvl?.userId });
      if (lvlUser?.isActive) {
        const commissionAmount = (roiPerDayCommissionAmount / 100) * 1;
        // update wallet
        await Wallet.findOneAndUpdate(
          { userId: lvlUser?.userId },
          {
            $inc: {
              levelIncome: +commissionAmount,
              totalIncome: +commissionAmount,
              activeIncome: +commissionAmount,
              directIncome:
                distributorLvl[0]?.level === "1" ? +commissionAmount : 0,
              indirectIncome:
                distributorLvl[0]?.level === "1" ? 0 : +commissionAmount,
            },
          }
        );
        // Create level income history
        const packageInfo = await PackageBuyInfo.findOne({
          userId: distributorLvl[0]?.userId,
        })
          .sort({ createdAt: -1 })
          .exec();

        const selfPackageInfo = await PackageBuyInfo.findOne({
          userId: lvlUser.userId,
        })
          .sort({ createdAt: -1 })
          .exec();

        // Create LevelIncome documents using bulk operation
        await LevelIncome.create({
          userId: lvlUser.userId,
          fullName: lvlUser.fullName,
          incomeFrom: distributorLvl[0]?.userId,
          incomeFromFullName: distributorLvl[0]?.fullName,
          level: `${distributorLvl[0]?.level}`,
          amount: commissionAmount,
          date: new Date(getIstTime().date).toDateString(),
          time: getIstTime().time,
          levelUserPackageInfo: packageInfo?.packageInfo,
          selfPackageInfo: selfPackageInfo?.packageInfo,
          transactionID: generateString(15),
        });
      }
    }
  } catch (error) {
    console.log("Level Error", error);
  }
};

module.exports = levelIncome;
