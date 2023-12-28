const express = require("express");
const getAllColorPredicionUsHistory = require("../../controller/private/colorPrediction.controller");
const router = express.Router();

router.get(
  "/get-all-color-priediction-history",
  getAllColorPredicionUsHistory.AllColorPredictionsHistory
);
router.post("/select-winner", getAllColorPredicionUsHistory.SelectWinner);
router.post("/set-referral-percentage", getAllColorPredicionUsHistory.winingRefferralPercentage);


router.get(
  "/get-betting-history/:periodId",
  getAllColorPredicionUsHistory.bettingHistory
);

module.exports = router;
