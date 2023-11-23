const mongoose = require("mongoose");

const AppVersionSchema = new mongoose.Schema(
  {
    versionName: { type: String, require: true },
    versionCode: { type: String, require: true },
    appurl: { type: String, require: true },
  },
  { timestamps: true }
);

const AppVersion = new mongoose.model("AppVersion", AppVersionSchema);

module.exports = AppVersion;
