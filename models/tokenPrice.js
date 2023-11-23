const mongoose = require("mongoose");

const TokenPriceSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    usdt_price_per_hashtoken: {
        type: Number,
        required: true, // Add validation rules as needed
    },
}, { timestamps: true });

const TokenPrice = mongoose.model("TokenPrice", TokenPriceSchema);

module.exports = TokenPrice;
