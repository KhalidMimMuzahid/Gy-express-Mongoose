const mongoose = require("mongoose");

const promotionalSchema = new mongoose.Schema(
  {
    image: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true }
);

const PromotionScheme = mongoose.model("PromotionScheme", promotionalSchema);

module.exports = { PromotionScheme };
