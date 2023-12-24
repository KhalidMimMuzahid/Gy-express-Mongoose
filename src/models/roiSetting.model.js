const mongoose = require("mongoose");

const roiSettingSchema = new mongoose.Schema(
  {
    roiPercentage: { type: Number, default: 0.5 },
  },
  { timestamps: true }
);

const RoiSetting = new mongoose.model("roiSetting", roiSettingSchema);

module.exports = { RoiSetting };
