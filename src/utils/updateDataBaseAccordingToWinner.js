const generateUniqueIdByDate = require("../config/generateUniqueIdByDate");
const getIstTime = require("../config/getTime");
const ColorPrediction = require("../models/colourPrediction ");
const ColorPredictionAll = require("../models/colourPredictionAll");
const ColorPredictionWinner = require("../models/colourPredictionWinner");
const ProidId = require("../models/periodId.model");
const PeriodRecord = require("../models/periodRecord");
const selectWin = require("../models/selectWin");
const Wallet = require("../models/wallet.model");
const DeleteAdminHistory = require("./DelectAdminHistory");
const getPayOutAmount = require("./getPayOutAmount");
const getWinnerFilterOptionArray = require("./getWinnerFilterOptionArray");

const updateDataBaseAccordingToWinner = async (option) => {
  const winnerFilterOptionArray = getWinnerFilterOptionArray(option);
  // const bets = await ColorPrediction.find({ option: win?.option });

  console.log({ winnerFilterOptionArray });
  const bets = await ColorPrediction.find({
    option: { $in: winnerFilterOptionArray },
  });
  console.log({ bets });
  let totalAmount = 0;

  // console.log("bets", bets);
  for (const bet of bets) {
    // console.log({ bet });
    // bet: {
    //   _id: new ObjectId("6581735c2b2fdf3820a4577c"),
    //   userId: '638235',
    //   option: 'x1',
    //   period: '202312190100',
    //   date: 'Tue Dec 19 2023',
    //   totalContractMoney: 10,
    //   createdAt: 2023-12-19T10:41:32.053Z,
    //   updatedAt: 2023-12-19T10:41:32.053Z,
    //   __v: 0
    // }
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

    // this ColorPredictionWinner is for storing every winner for every period
    // const winner = await ColorPredictionWinner.create({
    //   userId,
    //   result: option,
    //   period,
    //   bettingAmount: totalContractMoney,
    //   winningAmount: payout,
    //   date: new Date(getIstTime().date).toDateString(),
    // });
    // console.log(winner);
    // console.log({ _id });
    // console.log({ winningAmount: payout });
    const winningAmount = await ColorPredictionAll.findOneAndUpdate(
      { colorPrediction_id: _id },
      { winningAmount: payout },
      { upsert: true, new: true }
      // { new: true }
    );
    // console.log({ winningAmount });
    const wallects = await Wallet.findOneAndUpdate(
      { userId: bet.userId },
      {
        $inc: {
          winingWallect: +payout,
        },
      },
      { new: true }
    );
    totalAmount += payout;
    // console.log({ payout });
  }

  // console.log("total AMount:", totalAmount);
  // console.log("my id", bets[0].period);
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
    const lastUser = await ProidId.findOne().sort({ updatedAt: -1 });
    await PeriodRecord.create({
      periodId: lastUser?.period,
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
