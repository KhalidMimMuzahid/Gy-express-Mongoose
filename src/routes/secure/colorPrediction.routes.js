const { createColorPrediction } = require("../../controller/secure/colorPrediction.controller");
const { contactusValidators } = require("../../validation/contactus.validation");

const router = require("express").Router();

router.post("/create-predicted",  createColorPrediction);


module.exports = router;