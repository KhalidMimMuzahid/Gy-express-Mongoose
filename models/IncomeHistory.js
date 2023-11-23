const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const incomeHistorySchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    user_id: { type: String, required: true },
    sponsor_id: { type: String, required: true },
    sponsor_name: { type: String, required: true },
    incomeType: String,
    amount: Number,
    date: { type: String },
    time:String,
}, { timestamps: true });



const IncomeHistory = new mongoose.model("IncomeHistory", incomeHistorySchema);

module.exports = IncomeHistory;
