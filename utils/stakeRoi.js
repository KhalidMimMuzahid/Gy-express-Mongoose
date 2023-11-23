const cron = require("node-cron");
const { StakingPlan, StakingReward } = require("../models/StakingModel");
const { STAKE_CONSTANT } = require("../constant/staking.constant");
const getIstTime = require("../config/getTime");
const Wallet = require("../models/walletModel");
const generateString = require("../config/generateRandomString");
const levelIncomeRoi = require("./levelIncomeRoi");

const stakeRoiIncome = async () => {
  cron.schedule(
    "00 00 00 * * *", // This function will Night at 12 AM IST(Indian Standard Time)
    // "*/2 * * * *", // Every 5 mins
    // "*/30 * * * * *", // Every 30 secs
    async () => {
      try {
        const extStake = await StakingPlan.find({ isActive: true });
        for (const stake of extStake) {
          if (new Date(getIstTime().date).getTime() <= stake?.returnDate?.mileSecond) {
            // If today date equal to returnDate then, will get reward
            if (new Date(getIstTime().date).toDateString() === stake?.returnDate?.formattedDate) {
              await StakingPlan.findOneAndUpdate(
                { _id: stake._id },
                {
                  $set: {
                    isActive: false
                  }
                },
                { new: true }
              );
              await Wallet.findOneAndUpdate(
                { user_id: stake.userId },
                {
                  $inc: {
                    stakingRewardIncome: +stake?.stakeAmount,
                    totalHashProToken: +stake?.stakeAmount,
                    allToken: +stake?.stakeAmount,
                  }
                },
                { new: true }
              )
              await StakingReward.create({
                userId: stake.userId,
                fullName: stake?.fullName,
                sponsorId: stake?.sponsorId,
                sponsorName: stake?.sponsorName,
                stakingRewardIncome: stake.returnAmount,
                date: new Date(getIstTime().date).toDateString(),
                time: getIstTime().time
              })
            }
            // Daily Self Stake ROI Functionlity 
            const incomeDay = stake.incomeDay + 1;
            const monthToDay = Number(stake.stakeDuration * 30.417).toFixed(0); // 12 month * 30.417 day = 365 day
            const perDayPercentage =
              stake.stakeDuration === STAKE_CONSTANT.twelve.duration ? STAKE_CONSTANT.twelve.percentage :
                stake.stakeDuration === STAKE_CONSTANT.twentyFour.duration ? STAKE_CONSTANT.twentyFour.percentage :
                  stake.stakeDuration === STAKE_CONSTANT.thirtySix.duration ? STAKE_CONSTANT.thirtySix.percentage :
                    STAKE_CONSTANT.twelve.percentage;
            const perDayCommissionAmount = stake.stakeAmount / 100 * perDayPercentage / Number(monthToDay);
            // Creating History of Stake ROI in StakingPlan
            await StakingPlan.findOneAndUpdate(
              {
                _id: stake._id
              },
              {
                $inc: {
                  incomeDay: +1,
                  totalROIIncome: +Number(perDayCommissionAmount),
                },
                $push: {
                  history: {
                    userId: stake.userId,
                    fullName: stake.fullName,
                    incomeType: 'staking-reward',
                    stackingAmount: stake.stakeAmount,
                    commissionPercentagePerDay: perDayPercentage,
                    commissionAmount: Number(perDayCommissionAmount),
                    totalCommissionAmount: Number(
                      stake?.totalROIIncome + perDayCommissionAmount
                    ),
                    incomeDay: incomeDay,
                    incomeDate: new Date(getIstTime().date).toDateString(),
                    incomeTime: getIstTime().time,
                    incomeDateInt: new Date(getIstTime().date).getTime(),
                    transactionId: generateString(),
                  }
                }
              },
              { new: true }
            )
            // Updating Wallet with Stake ROI Amount
            await Wallet.findOneAndUpdate(
              { user_id: stake.userId },
              {
                $inc: {
                  stakingRoiIncome: +perDayCommissionAmount,
                  allToken: +perDayCommissionAmount,
                  totalHashProToken: +perDayCommissionAmount,
                }
              },
              { new: true }
            )
            // Distribute Level Income
            await levelIncomeRoi(stake, perDayCommissionAmount);
          }
        }
        console.log("Finished ROI Operation")
      } catch (error) {
        console.log("error", error)
      }
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  )
}
module.exports = { stakeRoiIncome };
