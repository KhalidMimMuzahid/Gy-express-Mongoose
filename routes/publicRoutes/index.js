const express = require("express");
const {
  registerUser,
  getSponsorName,
  authUser,
  ForgotPassword,
  resetPassword,
  sendOtp,
  checkMobileNumber,
  checkEmail,
  checkSponsorId,
  getCurrentAppVersion,
  getSetting,
  ForgotPasswordForApplication,
} = require("../../controllers/publicControllers/index");
const {
  forgotPasswordValidators,
  forgotPasswordValidationHandler,
  resetPasswordValidationHandler,
  resetPasswordValidators,
  registerValidators,
} = require("../../validation/inputValidation");
const router = express.Router();


router.get("/get_current_app_version", getCurrentAppVersion);
router.get("/get_setting", getSetting);
router.post(
  "/register",
  registerValidators,
  registerUser,
);
router.get("/get_sponsor/:user_id", getSponsorName);
router.post(
  "/login",
  // loginValidators,
  // loginValidationHandler,
  authUser
);
router.post(
  "/forgot_password",
  forgotPasswordValidators,
  forgotPasswordValidationHandler,
  ForgotPassword
);
router.post(
  "/forgot_password_apps",
  ForgotPasswordForApplication
);
router.post(
  "/reset_password/:token",
  resetPasswordValidators,
  resetPasswordValidationHandler,
  resetPassword
);
router.post("/send_otp", sendOtp);
router.get("/check_mobile/:mobile", checkMobileNumber);
router.get("/check_email/:email", checkEmail);
router.get("/check_sponsor_id/:sponsor_id", checkSponsorId);

module.exports = router;
