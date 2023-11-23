const mongoose = require("mongoose");

const updateSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    date: String,
    time: String,
  },
  { timestamps: true }
);

const Update = new mongoose.model("Update", updateSchema);

module.exports = Update;