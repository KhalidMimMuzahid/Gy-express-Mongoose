const cron = require("node-cron");
const selectWin = require("../models/selectWin");
const ColorPredictionHistory = require("../models/colourPredictionHistory");
const updateDataBaseAccordingToWinner = require("./updateDataBaseAccordingToWinner");
const findLowestValueObject = require("./findLowestValueObject");
const ProidId = require("../models/periodId.model");

const runColorPrediction = () => {
  cron.schedule(
    // "00 00 00 * * *", // This function will run Every Night 12 AM IST
    // "*/20 * * * *", // Every 20 min
    "*/3 * * * *", // every 3 min
    // "*/20 * * * * *", // every 3 sec
    async (res, req) => {
      try {
        const win = await selectWin.findOne({ id: "colorPredectionId" });
        // console.log({ win });

        if (win?.option) {
          try {
            await updateDataBaseAccordingToWinner(win?.option);
          } catch (error) {
            console.log({ errorX: error });
            return res.status(400).json({
              message: error.toString(),
            });
          }
        } else {
          try {
            const allHistories = await ColorPredictionHistory.find({});

            // console.log({ allHistories });
            const autoSelectedOptionDetails = findLowestValueObject(
              allHistories,
              "priceCL"
            );

            // console.log({ autoSelectedOptionDetails });

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

  cron.schedule(
    "00 00 00 * * *", // This function will run Every Night 12 AM IST
    async (res, req) => {
      try {
        // delete all periodIds here
        await ProidId.deleteMany({});
      } catch (error) {
        // console.log({ error });
      }
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );
};

module.exports = runColorPrediction;
