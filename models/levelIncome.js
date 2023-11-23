const mongoose = require("mongoose");

const levelIncomeSchema = new mongoose.Schema({
    userId: String,
    fullName: String,
    incomeType: String,
    amountOfToken: Number,
    amountOfDollar: Number,
    sponsorId: String,
    incomeFrom: {
        userId: String,
        fullName: String,
        email: String,
        level: Number,
        sponsorId: String,
        stackingAmount:Number,
    },
    date: String,
    time: String
}, { timestamps: true })

const LevelIncome = new mongoose.model("LevelIncome", levelIncomeSchema);

module.exports = LevelIncome ;