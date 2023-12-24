const generateRandomString = require("../config/generateRandomId");
const getIstTime = require("../config/getTime");

const { PackageRoi } = require("../models/topup.model");
const Wallet = require("../models/wallet.model");
const cron = require("node-cron");
const levelIncome = require("./levelIncome");

const runPackageROI = () => {
  cron.schedule(
    "00 00 00 * * *", // This function will run Every Night 12 AM IST
    // "*/2 * * * *", // Every 02 mins
    // "*/30 * * * * *", // every 05 secs
    async () => {
      const today = new Date(getIstTime().date).toDateString().split(" ")[0];
      if (today === "Sat" || today === "Sun") {
        return res.status(400).json({
          message: "ROI isn't distributed on Saturday and Sunday",
        });
      }
      const extRoi = await PackageRoi.find({});
      for (const ext of extRoi) {
        const wallet = await Wallet.findOne({ userId: ext.userId });
        // Regular ROI code
        if (ext.isActive) {
          console.log("userid", ext.userId);
          const incomeDayInc = ext.incomeDay + 1;
          const currentPackageAmount =
            ((ext.currentPackage + wallet?.activeIncome) / 100) * 0.5;

          const roiPerDayCommissionAmount = currentPackageAmount;
          // console.log(roiPerDayCommissionAmount);
          const roiPerDayCommissionPercentage = 0.5;
          await PackageRoi.findOneAndUpdate(
            { packageId: ext.packageId },
            {
              $inc: {
                incomeDay: +1,
                totalReturnedAmount: +roiPerDayCommissionAmount,
              },
              $push: {
                history: {
                  userId: ext.userId,
                  fullName: ext.fullName,
                  package: ext.currentPackage,
                  commissionPercentagePerDay: roiPerDayCommissionPercentage,
                  commissionAmount: Number(roiPerDayCommissionAmount).toFixed(
                    4
                  ),
                  totalCommissionAmount: Number(
                    ext.totalReturnedAmount + roiPerDayCommissionAmount
                  ).toFixed(4),
                  incomeDay: incomeDayInc,
                  incomeDate: new Date(getIstTime().date).toDateString(),
                  incomeTime: getIstTime().time,
                  incomeDateInt: new Date(getIstTime().date).getTime(),
                  transactionId: generateRandomString(),
                },
              },
            }
          );
          await Wallet.findOneAndUpdate(
            { userId: ext.userId },
            {
              $inc: {
                roiIncome: +roiPerDayCommissionAmount,
                totalIncome: +roiPerDayCommissionAmount,
                activeIncome: +roiPerDayCommissionAmount,
              },
            }
          );
          // // level income distribute
          await levelIncome(ext, roiPerDayCommissionAmount);
        }
      }
      console.log("Distribue roi");
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );
};

module.exports = runPackageROI;
