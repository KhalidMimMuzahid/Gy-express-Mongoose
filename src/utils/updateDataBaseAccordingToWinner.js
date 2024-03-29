const generateString = require("../config/generateRandomString");
const generateUniqueIdByDate = require("../config/generateUniqueIdByDate");
const getIstTime = require("../config/getTime");
const ColorPrediction = require("../models/colourPrediction ");
const ColorPredictionAll = require("../models/colourPredictionAll");
const ColorPredictionWinner = require("../models/colourPredictionWinner");
const Level = require("../models/level.model");
const WinningSharePercentage = require("../models/levelCommissionPerCentageForWinningShare");
const LevelIncome = require("../models/levelIncome.model");
const ProidId = require("../models/periodId.model");
const PeriodRecord = require("../models/periodRecord");
const selectWin = require("../models/selectWin");
const Wallet = require("../models/wallet.model");
const WiningReferralPercentage = require("../models/winingReferrlIncomePercentage");
const DeleteAdminHistory = require("./DelectAdminHistory");
const findObjectFromArrayOfObject = require("./findObjectFromArrayOfObject");
const getPayOutAmount = require("./getPayOutAmount");
const getWinnerFilterOptionArray = require("./getWinnerFilterOptionArray");

const updateDataBaseAccordingToWinner = async (option) => {
  const winnerFilterOptionArray = getWinnerFilterOptionArray(option);
  const bets = await ColorPrediction.find({
    option: { $in: winnerFilterOptionArray },
  });
  let totalAmount = 0;
  const date = new Date(getIstTime().date).toDateString();
  const time = getIstTime().time;

  // here we need winningSharePercentage not inside of any loop then it will call db multiple time
  const winningSharePercentage = await WinningSharePercentage.findOne({});
  for (const bet of bets) {
    const {
      _id,
      option: optionSelectedByUser,
      totalContractMoney,
      userId,
      period,
    } = bet;

    let payout = getPayOutAmount(
      optionSelectedByUser,
      option,
      totalContractMoney
    );
    const winningAmount = await ColorPredictionAll.findOneAndUpdate(
      { colorPrediction_id: _id },
      { winningAmount: payout },
      { upsert: true, new: true }
      // { new: true }
    );
    const colorPredictionWinner = await ColorPredictionWinner.create({
      userId: bet?.userId,
      result: option,
      period: period,
      date,
      time,
      bettingAmount: totalContractMoney,
      winningAmount: payout,
    });

    const wallects = await Wallet.findOneAndUpdate(
      { userId: bet.userId },
      {
        $inc: {
          winingAmount: +payout,
          totalIncome: +payout,
          withdrawalBallance: +payout,
        },
      },
      { new: true }
    );
    totalAmount += payout;
    // now its time to share winning wallet to all levels of users
    const allLevelUsers = await Level.find(
      { "level.userId": bet.userId },
      { userId: 1, level: 1 }
    );
    // console.log({ allLevelUsers });

    if (allLevelUsers.length > 0) {
      for (const levelUser of allLevelUsers) {
        const levelObject = findObjectFromArrayOfObject(
          levelUser?.level,
          "userId",
          bet.userId
        );
        // console.log({
        //   percentage: winningSharePercentage[`level${levelObject?.level}`],
        // });
        let percentage;
        try {
          percentage = levelObject?.level
            ? winningSharePercentage[`level${levelObject?.level}`]
              ? winningSharePercentage[`level${levelObject?.level}`]
              : 1
            : 1;
        } catch (error) {
          // console.log({ error });
          percentage = 1;
        }

        const winningSharePayout = (payout * percentage) / 100;
        const winningSharedUser = await Wallet.findOneAndUpdate(
          { userId: levelUser?.userId },
          {
            $inc: {
              winingFromLevel: +winningSharePayout,
              totalIncome: +winningSharePayout,
              withdrawalBallance: +winningSharePayout,
            },
          },
          { new: true }
        );
        if (winningSharedUser) {
          // WiningReferralPercentage
          await LevelIncome.create({
            // level: levelObject?.level,
            // incomeFromUserId: bet?.userId,
            // incomeToUserId: levelUser?.userId,
            // winningAmount: winningSharePayout,
            // percentage: percentage,
            // percentageOfTotalAmount: payout,
            // type: "winning-share",
            // date,

            userId: levelUser?.userId,
            // fullName,
            incomeFrom: bet?.userId,
            // incomeFromFullName,
            level: levelObject?.level,
            type: "winning-share",
            percentageOfTotalAmount: payout,
            percentage: percentage,
            amount: winningSharePayout,
            date,
            time,
            transactionID: generateString(15),
          });
        }
      }
    }
  }

  const periodId = bets[0]?.period;
  if (periodId) {
    await PeriodRecord.create({
      periodId: periodId,
      option: option,
      // color: win.color,
      // number: win.number,
      price: totalAmount,
    });
  } else {
    // we need to create PeriodRecord document ==> first find the current period and create
    const lastPeriod = await ProidId.findOne().sort({ updatedAt: -1 });
    await PeriodRecord.create({
      periodId: lastPeriod?.period,
      option: option,
      price: totalAmount,
    });
  }
  await ColorPrediction.deleteMany({});
  await selectWin.deleteMany({}); // why are deleting all winner history here ?
  await DeleteAdminHistory(); // deleting admin dashboard data when the period has ended
  await generateUniqueIdByDate(); // generating periodId for every single period
  // console.log("Color Prediction Select Winner Done");
};

module.exports = updateDataBaseAccordingToWinner;
