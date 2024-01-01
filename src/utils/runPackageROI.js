const generateRandomString = require("../config/generateRandomId");
const getIstTime = require("../config/getTime");

const { PackageRoi } = require("../models/topup.model");
const Wallet = require("../models/wallet.model");
const cron = require("node-cron");
const levelIncome = require("./levelIncome");
const { RoiSetting } = require("../models/roiSetting.model");

const runPackageROI = () => {
  cron.schedule(
    "00 00 00 * * *", // This function will run Every Night 12 AM IST
    // "*/2 * * * *", // Every 02 mins
    // "*/30 * * * * *", // every 05 secs
    async () => {
      try {
        const roiPercentage = await RoiSetting.findOne({});
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
              ((Number(ext.currentPackage) + Number(wallet?.activeIncome)) /
                100) *
              Number(roiPercentage?.roiPercentage);

            const roiPerDayCommissionAmount = currentPackageAmount;
            // console.log(roiPerDayCommissionAmount);
            const roiPerDayCommissionPercentage = Number(
              roiPercentage?.roiPercentage
            );
            await PackageRoi.findOneAndUpdate(
              { packageId: ext.packageId },
              {
                $inc: {
                  incomeDay: +1,
                  totalReturnedAmount: +Number(roiPerDayCommissionAmount),
                },
                $push: {
                  history: {
                    userId: ext.userId,
                    fullName: ext.fullName,
                    package: ext.currentPackage,
                    commissionPercentagePerDay: Number(
                      roiPerDayCommissionPercentage
                    ),
                    commissionAmount: Number(roiPerDayCommissionAmount).toFixed(
                      4
                    ),
                    totalCommissionAmount: Number(
                      Number(ext.totalReturnedAmount) +
                        Number(roiPerDayCommissionAmount)
                    ).toFixed(4),
                    incomeDay: Number(incomeDayInc),
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
                  roiIncome: +Number(roiPerDayCommissionAmount),
                  totalIncome: +Number(roiPerDayCommissionAmount),
                  withdrawalBallance: +Number(roiPerDayCommissionAmount),
                },
              }
            );
            // // level income distribute
            await levelIncome(ext, Number(roiPerDayCommissionAmount));
          }
        }
        console.log("Distribue roi");
      } catch (error) {
        console.log("error", error);
      }
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );
};

module.exports = runPackageROI;
