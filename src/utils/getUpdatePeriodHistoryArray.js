const getUpdatePeriodHistoryArray = (option, totalContractMoney) => {
  let updatePeriodHistoryArray = [];
  if (option === "x1") {
    updatePeriodHistoryArray = [
      {
        option: "y2",
        amount: totalContractMoney,
        priceCL: 2 * totalContractMoney,
      },
      {
        option: "y4",
        amount: totalContractMoney,
        priceCL: 2 * totalContractMoney,
      },
      {
        option: "y8",
        amount: totalContractMoney,
        priceCL: 2 * totalContractMoney,
      },
      {
        option: "y10",
        amount: totalContractMoney,
        priceCL: 2 * totalContractMoney,
      },
      {
        option: "y6",
        amount: totalContractMoney,
        priceCL: 1.5 * totalContractMoney,
      },
    ];
  } else if (option === "x2") {
    updatePeriodHistoryArray = [
      {
        option: "y1",
        amount: totalContractMoney,
        priceCL: 4.5 * totalContractMoney,
      },
      {
        option: "y6",
        amount: totalContractMoney,
        priceCL: 4.5 * totalContractMoney,
      },
    ];
  } else if (option === "x3") {
    updatePeriodHistoryArray = [
      {
        option: "y3",
        amount: totalContractMoney,
        priceCL: 2 * totalContractMoney,
      },
      {
        option: "y5",
        amount: totalContractMoney,
        priceCL: 2 * totalContractMoney,
      },
      {
        option: "y7",
        amount: totalContractMoney,
        priceCL: 2 * totalContractMoney,
      },
      {
        option: "y9",
        amount: totalContractMoney,
        priceCL: 2 * totalContractMoney,
      },
    ];
  } else if (option === "x4") {
    updatePeriodHistoryArray = [
      {
        option: "y1",
        amount: totalContractMoney,
        priceCL: 9 * totalContractMoney,
      },
    ];
  } else if (option === "x5") {
    updatePeriodHistoryArray = [
      {
        option: "y2",
        amount: totalContractMoney,
        priceCL: 9 * totalContractMoney,
      },
    ];
  } else if (option === "x6") {
    updatePeriodHistoryArray = [
      {
        option: "y3",
        amount: totalContractMoney,
        priceCL: 9 * totalContractMoney,
      },
    ];
  } else if (option === "x7") {
    updatePeriodHistoryArray = [
      {
        option: "y4",
        amount: totalContractMoney,
        priceCL: 9 * totalContractMoney,
      },
    ];
  } else if (option === "x8") {
    updatePeriodHistoryArray = [
      {
        option: "y5",
        amount: totalContractMoney,
        priceCL: 9 * totalContractMoney,
      },
    ];
  } else if (option === "x9") {
    updatePeriodHistoryArray = [
      {
        option: "y6",
        amount: totalContractMoney,
        priceCL: 9 * totalContractMoney,
      },
    ];
  } else if (option === "x10") {
    updatePeriodHistoryArray = [
      {
        option: "y7",
        amount: totalContractMoney,
        priceCL: 9 * totalContractMoney,
      },
    ];
  } else if (option === "x11") {
    updatePeriodHistoryArray = [
      {
        option: "y8",
        amount: totalContractMoney,
        priceCL: 9 * totalContractMoney,
      },
    ];
  } else if (option === "x12") {
    updatePeriodHistoryArray = [
      {
        option: "y9",
        amount: totalContractMoney,
        priceCL: 9 * totalContractMoney,
      },
    ];
  } else if (option === "x13") {
    updatePeriodHistoryArray = [
      {
        option: "y10",
        amount: totalContractMoney,
        priceCL: 9 * totalContractMoney,
      },
    ];
  }

  return updatePeriodHistoryArray;
};
module.exports = getUpdatePeriodHistoryArray;
