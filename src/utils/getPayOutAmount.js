const getPayOutAmount = (
  optionSelectedByUser,
  optionSelectedByAdmin,
  totalContractMoney
) => {
  let amount = 0;
  if (optionSelectedByAdmin === "y1") {
    amount =
      optionSelectedByUser === "x4"
        ? totalContractMoney * 9
        : optionSelectedByUser === "x2"
        ? (amount = totalContractMoney * 4.5)
        : (amount = totalContractMoney * 1.5); // this is for x3 default
  } else if (optionSelectedByAdmin === "y2") {
    amount =
      optionSelectedByUser === "x5"
        ? totalContractMoney * 9
        : totalContractMoney * 2; // this is for x1 default
  } else if (optionSelectedByAdmin === "y3") {
    amount =
      optionSelectedByUser === "x6"
        ? totalContractMoney * 9
        : totalContractMoney * 2; // this is for x3 default
  } else if (optionSelectedByAdmin === "y4") {
    amount =
      optionSelectedByUser === "x7"
        ? totalContractMoney * 9
        : totalContractMoney * 2; // this is for x1 default
  } else if (optionSelectedByAdmin === "y5") {
    amount =
      optionSelectedByUser === "x8"
        ? totalContractMoney * 9
        : totalContractMoney * 2; // this is for x3 default
  } else if (optionSelectedByAdmin === "y6") {
    amount =
      optionSelectedByUser === "x9"
        ? totalContractMoney * 9
        : optionSelectedByUser === "x2"
        ? (amount = totalContractMoney * 4.5)
        : (amount = totalContractMoney * 1.5); // this is for x1 default
  } else if (optionSelectedByAdmin === "y7") {
    amount =
      optionSelectedByUser === "x10"
        ? totalContractMoney * 9
        : totalContractMoney * 2; // this is for x3 default
  } else if (optionSelectedByAdmin === "y8") {
    amount =
      optionSelectedByUser === "x11"
        ? totalContractMoney * 9
        : totalContractMoney * 2; // this is for x1 default
  } else if (optionSelectedByAdmin === "y9") {
    amount =
      optionSelectedByUser === "x12"
        ? totalContractMoney * 9
        : totalContractMoney * 2; // this is for x3 default
  } else if (optionSelectedByAdmin === "y10") {
    amount =
      optionSelectedByUser === "x13"
        ? totalContractMoney * 9
        : totalContractMoney * 2; // this is for x1 default
  }

  return amount;
};
module.exports = getPayOutAmount;
