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
    return userID;
  } catch (error) {
    console.log(error);
  }
};
const checkIsNewDate = () => {
  // // Get the current date and time in Indian Standard Time (IST)
  const currentDate = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  // Extract the hours and minutes from the current time
  const [hours, minutes] = currentDate.split(" ")[1].split(":").map(Number);

  // ---------------------------

  // Get the current date and time in Indian Standard Time (IST)

  // --------------------------------
  console.log({ hours, minutes });
  // Check if the time is between 00:00am and 00:03am
  return hours === 0 && minutes >= 0 && minutes <= 3;
};
const generateUniqueIdByDate = async () => {
  const lastUser = await ProidId.findOne().sort({ updatedAt: -1 });
  if (lastUser) {
    const today = new Date();

    const isNewDate = checkIsNewDate();
    let periodId;
    if (isNewDate) {
      await ProidId.deleteMany({}); // deleting all periodIds
      periodId = userIDGenerator(); // generating id from 0001
    } else {
      const todayStr = `${today.getFullYear()}${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;
      const lastUserID = lastUser?.period;
      const check = lastUserID?.substring(lastUserID?.length - 4);
      const lastUsedNumber = Number(check);
      periodId = `${todayStr}${(lastUsedNumber + 1)
        ?.toString()
        .padStart(4, "0")}`;
    }
    await ProidId.create({
      period: periodId,
    });
  } else {
    const periodId = userIDGenerator(); // generating id from 0001

    await ProidId.create({
      period: periodId,
    });
  }
};

module.exports = generateUniqueIdByDate;
