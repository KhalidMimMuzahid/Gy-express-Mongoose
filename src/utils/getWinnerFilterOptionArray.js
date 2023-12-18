const getWinnerFilterOptionArray = (option) => {
  let winnerFilterOptionArray = [];
  if (option === "y1") {
    winnerFilterOptionArray = ["x4", "x2", "x3"];
  } else if (option === "y2") {
    winnerFilterOptionArray = ["x5", "x1"];
  } else if (option === "y3") {
    winnerFilterOptionArray = ["x6", "x3"];
  } else if (option === "y4") {
    winnerFilterOptionArray = ["x7", "x1"];
  } else if (option === "y5") {
    winnerFilterOptionArray = ["x8", "x3"];
  } else if (option === "y6") {
    winnerFilterOptionArray = ["x9", "x1", "x2"];
  } else if (option === "y7") {
    winnerFilterOptionArray = ["x10", "x3"];
  } else if (option === "y8") {
    winnerFilterOptionArray = ["x11", "x1"];
  } else if (option === "y9") {
    winnerFilterOptionArray = ["x12", "x3"];
  } else if (option === "y10") {
    winnerFilterOptionArray = ["x13", "x1"];
  }

  return winnerFilterOptionArray;
};
module.exports = getWinnerFilterOptionArray;
