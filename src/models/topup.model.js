const mongoose = require("mongoose");

const packageBuyInfoSchema = new mongoose.Schema(
  {
    userId: String,
    userFullName: String,
    sponsorId: String,
    sponsorName: String,
    packageInfo: {
      amount: Number,
      date: String,
      time: String,
    },
    packageType: String,
  },
  { timestamps: true }
);

const PackageBuyInfo = mongoose.model("PackageBuyInfo", packageBuyInfoSchema);

const packageRoiSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    sponsorId: {
      type: String,
      required: true,
    },
    sponsorName: String,
    packageId: { type: String, required: true },
    currentPackage: {
      type: Number,
      required: true,
    },
    previousPackage: [
      {
        amount: Number,
        startDate: String,
        endDate: String,
      },
    ],
    isActive: Boolean,
    incomeDay: {
      type: Number,
      required: true,
    },
    totalReturnedAmount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    history: [
      {
        userId: { type: String, required: true },
        fullName: { type: String, required: true },
        package: { type: Number, required: true },
        commissionPercentagePerDay: { type: Number, required: true },
        commissionAmount: { type: Number, required: true },
        totalCommissionAmount: { type: Number, required: true },
        incomeDay: { type: Number, required: true },
        incomeDate: { type: String, required: true },
        incomeTime: { type: String, required: true },
        incomeDateInt: { type: Number, required: true },
        transactionId: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const PackageRoi = mongoose.model("PackageRoi", packageRoiSchema);

module.exports = {
  PackageBuyInfo,
  PackageRoi,
};
