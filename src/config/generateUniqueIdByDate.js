const ColorPredictionAll = require("../models/colourPredictionAll");
const ProidId = require("../models/periodId.model");

const userIDGenerator = () => {
  let lastUsedNumber = 1;

  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;

    const userID = `${todayStr}${lastUsedNumber.toString().padStart(4, "0")}`;
    //   lastUsedNumber++; // Increment the number for the next call
    return userID;
  } catch (error) {
    console.log(error);
  }
};

const generateUniqueIdByDate = async () => {
  // console.log("xxxxxxxxxxxxyyyyyyyyyyyyy");
  const lastUser = await ProidId.findOne().sort({ updatedAt: -1 });
  if (lastUser) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;
    const lastUserID = lastUser?.period;
    const check = lastUserID?.substring(lastUserID?.length - 4);
    const lastUsedNumber = Number(check);
    // console.log({ lastUsedNumber });
    const newUserID = `${todayStr}${(lastUsedNumber + 1)
      ?.toString()
      .padStart(4, "0")}`;
    // console.log({ newUserID });

    await ProidId.create({
      period: newUserID,
    });
  } else {
    const periodId = userIDGenerator();

    // console.log({ periodId });
    await ProidId.create({
      period: periodId,
    });
  }
  // console.log({ lastUser });

  // const admin = lastUser?.userId?.toLowerCase();
  // if (!lastUser) {
  //   const newID = userIDGenerator();
  //   return newID;
  // } else if (check == "9999") {
  //   const newID = userIDGenerator();
  //   console.log({ newID });
  //   return newID;
  // } else {
  //   const lastUsedNumber = Number(check);
  //   console.log({ lastUsedNumber });
  //   const newUserID = `${todayStr}${(lastUsedNumber + 1)
  //     ?.toString()
  //     .padStart(4, "0")}`;
  //   console.log({ newUserID });
  //   return newUserID;
  // }
};

module.exports = generateUniqueIdByDate;
