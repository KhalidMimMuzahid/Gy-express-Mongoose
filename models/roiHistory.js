const mongoose = require("mongoose");

const roiSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    amount: Number,
    date: String,
    time: String,
  },
  { timestamps: true }
);

const RoiHistory = mongoose.model("RoiHistory", roiSchema);

module.exports = { RoiHistory };
