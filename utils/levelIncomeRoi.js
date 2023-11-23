const User = require("../models/userModel");
const getIstTime = require("../config/getTime");
const LevelIncome = require("../models/levelIncome");
const Wallet = require("../models/walletModel");
const Level = require("../models/levelModel");
const { LEVEL_INCOME_PERCENTAGE } = require("../constant/staking.constant");

const levelIncomeRoi = async (ext, roiPerDayCommissionAmount) => {
  try {
    const levels = await Level.find({ "level.user_id": ext?.userId });
    for (const lvl of levels) {
      // find distributor level user level
      const distributorLvl = lvl?.level?.filter(
        (d) => d?.user_id === ext?.userId
      );
      // find upline user
      const lvlUser = await User.findOne({ user_id: lvl?.user_id });
      const commissionAmount = (Number(roiPerDayCommissionAmount) / 100) * LEVEL_INCOME_PERCENTAGE[`${Number(distributorLvl[0]?.level)}`];
      // update wallet
      await Wallet.findOneAndUpdate(
        { user_id: lvlUser?.user_id },
        {
          $inc: {
            directIncome:
              distributorLvl[0]?.level === "1" ? +commissionAmount : +0,
            indirectIncome: distributorLvl[0]?.level !== "1" ? +commissionAmount : +0,
            teamIncome: +commissionAmount,
            allToken: +commissionAmount,
            totalHashProToken: +commissionAmount,
          },
        }
      );
      // Create LevelIncome documents using bulk operation
      await LevelIncome.create({
        userId: lvlUser.user_id,
        fullName: lvlUser.name,
        incomeType: "team-reward",
        sponsorId: lvlUser.sponsor_id,
        amountOfToken: commissionAmount,
        incomeFrom: {
          userId: distributorLvl[0]?.user_id,
          fullName: distributorLvl[0]?.name,
          email: distributorLvl[0]?.email,
          level: `${distributorLvl[0]?.level}`,
          sponsorId: distributorLvl[0]?.sponsor_id,
          stackingAmount: ext?.stakeAmount
        },
        date: new Date(getIstTime().date).toDateString(),
        time: getIstTime().time,
      });
    }
  } catch (error) {
    console.log("Level Error", error);
  }
};

module.exports = levelIncomeRoi;
