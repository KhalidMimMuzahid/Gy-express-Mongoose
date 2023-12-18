const mongoose = require("mongoose");

const periodRecordSchema = new mongoose.Schema(
  {
    periodId: { type: String, require: true },
    // color: {
    //   type: String,
    // },
    option: String,
    price: String,
    // number: Number,
    date: String,
  },
  { timestamps: true }
);

const PeriodRecord = new mongoose.model(
  "periodRecord",
  periodRecordSchema
);

module.exports = PeriodRecord;
