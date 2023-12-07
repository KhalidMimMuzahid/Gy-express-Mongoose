const express = require("express");
const getAllColorPredicionUsHistory = require("../../controller/private/colorPrediction.controller");
const router = express.Router();

router.get(
  "/get-all-color-priediction-history",
  getAllColorPredicionUsHistory.AllColorPredictionsHistory
);
router.post("/select-winner", getAllColorPredicionUsHistory.SelectWinner);
router.post("/set-referral-percentage", getAllColorPredicionUsHistory.winingRefferralPercentage);

module.exports = router;
