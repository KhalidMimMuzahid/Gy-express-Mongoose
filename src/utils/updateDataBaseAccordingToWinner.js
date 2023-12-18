const getIstTime = require("../config/getTime");
const ColorPrediction = require("../models/colourPrediction ");
const ColorPredictionWinner = require("../models/colourPredictionWinner");
const PeriodRecord = require("../models/periodRecord");
const Wallet = require("../models/wallet.model");
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
    const {
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

    const winner = await ColorPredictionWinner.create({
      // fullName: bet?.fullName,
      // number: bet?.number,
      userId,
      result: option,
      period,
      amount: payout || 0,
      date: new Date(getIstTime().date).toDateString(),
    });
    // console.log(winner);
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
  }

  await ColorPrediction.deleteMany({});
  await selectWin.deleteMany({}); // why are deleting all winner history here ?
  await DeleteAdminHistory(); // deleting admin dashboard data when the period has ended
  await generateUniqueIdByDate(); // generating periodId for every single period
  // console.log("Color Prediction Select Winner Done");
};

module.exports = updateDataBaseAccordingToWinner;
