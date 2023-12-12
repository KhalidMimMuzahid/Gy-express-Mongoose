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

const runColorPrediction = () => {
  cron.schedule(
    // "00 00 00 * * *", // This function will run Every Night 12 AM IST
    // "*/3 * * * *", // Every 20 min
    "*/3 * * * *", // every 3 min
    // "*/3 * * * * *", // every 3 sec
    async (res, req) => {
      try {
        const win = await selectWin.findOne({ id: "colorPredectionId" });
        // console.log({ win });
        if (win?.color || win?.number) {
          try {
            const bets = await ColorPrediction.find({
              $or: [{ color: win.color }, { number: win.number }],
            });
            let totalAmount = 0;
            // console.log(bets);
            for (const bet of bets) {
              let payout = 0;
              if (bet.color === "green") {
                if (bet.box === win.number) {
                  payout = bet.contractMoney * 9;
                } else if ([1, 3, 7, 9].includes(win.number)) {
                  payout = bet.contractMoney * 2;
                } else if (win.number === 5) {
                  payout = bet.contractMoney * 1.5;
                }
              } else if (bet.color === "red") {
                if (bet.box === win.number) {
                  payout = bet.contractMoney * 9;
                } else if ([2, 4, 6, 8].includes(win.number)) {
                  payout = bet.contractMoney * 2;
                } else if (win.number === 0) {
                  payout = bet.contractMoney * 1.5;
                }
              } else if (bet.color === "violet") {
                if (bet.box === win.number) {
                  payout = bet.contractMoney * 9;
                } else if ([0, 5].includes(win.number)) {
                  payout = bet.contractMoney * 4.5;
                }
              } else if (bet.color === "red-violet") {
                if (bet.box === win.number) {
                  payout = bet.contractMoney * 9;
                } else if ([0, 5].includes(win.number)) {
                  payout = bet.contractMoney * 1.5;
                }
              } else if (bet.color === "green-violet") {
                if (bet.box === win.number) {
                  payout = bet.contractMoney * 9;
                } else if ([0, 5].includes(win.number)) {
                  payout = bet.contractMoney * 1.5;
                }
              } else if (bet.number === win.number) {
                payout = bet.contractMoney * 9;
              }

              const winner = await ColorPredictionWinner.create({
                userId: bet?.userId,
                fullName: bet?.fullName,
                result: win?.color,
                period: bet?.period,
                number: bet?.number,
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
            const periodId = bets[0].period;

            await PeriodRecord.create({
              periodId: periodId,
              color: win.color,
              number: win.number,
              price: totalAmount,
            });

            await ColorPrediction.deleteMany({});
            await selectWin.deleteMany({});
            await generateUniqueIdByDate();
            await DeleteAdminHistory();
            // console.log("Color Prediction Select Winner Done");
          } catch (error) {
            // console.log(error);
            return res.status(400).json({
              message: error.toString(),
            });
          }
        } else {
          await generateUniqueIdByDate();
          await DeleteAdminHistory();
          await selectWin.deleteMany({});
          await backAmount();
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
