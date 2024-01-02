const express = require("express");
const getAllColorPredicionUsHistory = require("../../controller/private/colorPrediction.controller");
const router = express.Router();

router.get(
  "/get-all-color-priediction-history",
  getAllColorPredicionUsHistory.AllColorPredictionsHistory
);
router.post("/select-winner", getAllColorPredicionUsHistory.SelectWinner);



router.get(
  "/get-betting-history/:periodId",
  getAllColorPredicionUsHistory.bettingHistory
);

router.get(
  "/get-betting-history-by-user-id/:userId",
  getAllColorPredicionUsHistory.bettingHistoryByUserId
);
router.get(
  "/get-color-statistics/:periodId",
  getAllColorPredicionUsHistory.getColorStatistics
);
module.exports = router;
