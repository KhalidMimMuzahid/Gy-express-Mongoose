const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: String,
    kyc_method: String,
    card_number: String,
    front_side: String,
    back_side: String,
    status: {
        type: String, default: "pending" 
    },
    submission_date: String,
},
{ timestamps: true })

const Kyc = new mongoose.model('kyc', schema);
module.exports = Kyc;
