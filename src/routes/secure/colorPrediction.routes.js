const {
  createColorPrediction,
  getColorPrediction,
  getPeriodHistory,
} = require("../../controller/secure/colorPrediction.controller");
const {
  contactusValidators,
} = require("../../validation/contactus.validation");

const router = require("express").Router();

router.post("/create-predicted", createColorPrediction);
router.get("/get-predicted", getColorPrediction);
router.post("/get-period-history", getPeriodHistory);

module.exports = router;
