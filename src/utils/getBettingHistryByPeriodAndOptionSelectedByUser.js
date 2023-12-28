const ColorPredictionAll = require("../models/colourPredictionAll");
const getWinnerFilterOptionArray = require("./getWinnerFilterOptionArray");

async function getBettingHistoryByPeriodAndOptionSelectedByUser(
  option,
  period,
  winner
) {
  const winnerFilterOptionArray = getWinnerFilterOptionArray(winner);
  const users = await ColorPredictionAll.find({ option, period });

  const bettingCount = users?.length || 0;
  const bettingAmount = users?.reduce(function (total, currentUser) {
    return total + (currentUser?.totalContractMoney || 0);
  }, 0);
  const winningAmount = users?.reduce(function (total, currentUser) {
    return total + (currentUser?.winningAmount || 0);
  }, 0);
  const isWinner = winnerFilterOptionArray.includes(option);
  return { bettingCount, bettingAmount, winningAmount, users, isWinner };
}

module.exports = getBettingHistoryByPeriodAndOptionSelectedByUser;
