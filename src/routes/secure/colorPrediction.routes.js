const { createColorPrediction,getColorPrediction } = require("../../controller/secure/colorPrediction.controller");
const { contactusValidators } = require("../../validation/contactus.validation");

const router = require("express").Router();

router.post("/create-predicted",  createColorPrediction);
router.get("/get-predicted",  getColorPrediction);


module.exports = router;