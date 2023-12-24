const getIstTime = require("../config/getTime");
const cron = require("node-cron");

const Wallet = require("../models/wallet.model");
const selectWin = require("../models/selectWin");
const backAmount = require("./backAmount");
const ColorPrediction = require("../models/colourPrediction ");
const ColorPredictionWinner = require("../models/colourPredictionWinner");
const ColorPredictionHistory = require("../models/colourPredictionHistory");
const generateUniqueIdByDate = require("../config/generateUniqueIdByDate");
const PeriodRecord = require("../models/periodRecord");
const DeleteAdminHistory = require("./DelectAdminHistory");
const getWinnerFilterOptionArray = require("./getWinnerFilterOptionArray");
const getPayOutAmount = require("./getPayOutAmount");
const updateDataBaseAccordingToWinner = require("./updateDataBaseAccordingToWinner");
const findMaxValueObject = require("./findMaxValueObject");
const findLowestValueObject = require("./findLowestValueObject");

const runColorPrediction = () => {
  cron.schedule(
    // "00 00 00 * * *", // This function will run Every Night 12 AM IST
    // "*/20 * * * *", // Every 20 min
    "*/3 * * * *", // every 3 min
    // "*/20 * * * * *", // every 3 sec
    async (res, req) => {
      try {
        const win = await selectWin.findOne({ id: "colorPredectionId" });
        console.log({ win });

        if (win?.option) {
          try {
            await updateDataBaseAccordingToWinner(win?.option);
          } catch (error) {
            // console.log(error);
            return res.status(400).json({
              message: error.toString(),
            });
          }
        } else {
          try {
            const allHistories = await ColorPredictionHistory.find({});

            console.log({ allHistories });
            const autoSelectedOptionDetails = findLowestValueObject(
              allHistories,
              "priceCL"
            );

            console.log({ autoSelectedOptionDetails });

            await updateDataBaseAccordingToWinner(
              autoSelectedOptionDetails?.option
            );
          } catch (error) {
            console.log({ error });
            return res.status(400).json({
              message: error.toString(),
            });
          }

          // await backAmount(); //   if any  how this period of bes has been cancel, off of users should get  their money back
          // console.log("All Amount Back Done");
        }
      } catch (error) {
        // console.log({ error });
      }
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );
};

module.exports = runColorPrediction;



