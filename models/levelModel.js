const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema(
  {
    name: String,
    user_id: String,
    email: String,
    sponsor_id: String,
    level: [
      new mongoose.Schema({
        user: { type: mongoose.Types.ObjectId, ref: "User" },
        level: String,
        user_id: String,
        name: String,
        mobile: String,
        email: String,
        sponsor_id: String,
        joining_date: String,
      }),
    ],
  },
  { timestamps: true }
);

const Level = new mongoose.model("Level", levelSchema);

module.exports = Level;
