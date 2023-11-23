const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
    {
        settingId: {
            type: String,
            default: "hashpro-setting"
        },
        appUrl: String,
    },
    { timestamps: true }
);

const Setting = new mongoose.model("Setting", SettingSchema);

module.exports = Setting;
