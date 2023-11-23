const express = require("express");
const {
  changePassword,
  updateUserInfo,
  updateEmail,
  withdrawAmount,
  testAPI,
  depositINR,
  depositUSD,
  depositHPT,
  depositHistoryByUser,
  getUserWalletByUser,
  SwapTokenAPI,
  swapHistoryByUser,
  GetDashboardByUser,
  getDirectIncome,
  getDirectTeam,
  withdrawHistory,
  createStakingAmount,
  getStakeHistory,
  createUnStakeAmount,
  getMyTeamInfo,
  getTeamLevelsInfo,
  getTeamLevelDetails,
  getStatistics,
  getWithdrawDetails,
  updateWallet,
  getReward,
  getSystemWallet,
  getWalletDetails,
  getdashboardDetails,
  createFundTransfer,
  getFundTransferHistory,
  receivedFundTransferHistory,
  createContactUs,
  getContactUsHistory,
  getUpdates,
  createSupportTicket,
  getSupportHistory,
  getPromotionalSchemeController,
  updateProfilePic,

  getTokenPirce,

} = require("../../controllers/secureControllers");
const { verifyJWT, verifyUser } = require("../../middleware/authMiddleware");

const {
  updatePasswordValidationHandler,
  updatePasswordValidators,
  updateEmailValidators,
  updateEmailValidationHandler,
  contactusValidators,
} = require("../../validation/inputValidation");
const { stakingValidation, unStakingValidation } = require("../../validation/stakeValidation");
const { swapValidation } = require("../../validation/swapValidation");
const { fundValidation } = require("../../validation/fundTransferValidation");
const multer = require("../../middleware/multer");
const { withdrawAmountValidators } = require("../../validation/withdrawValidation");
const { getPopUpImg } = require("../../controllers/commonControllers");

const router = express.Router();
const middleware = [verifyJWT, verifyUser];

router.use(middleware);

router.get("/get_dashboard_by_user", GetDashboardByUser);
router.get("/get_direct_income", getDirectIncome);
router.get("/get_direct_team", getDirectTeam);
router.get("/get_swap_history_by_user", swapHistoryByUser);
router.post("/swap_by_user", swapValidation, SwapTokenAPI);
router.get("/get_wallet_by_user", getUserWalletByUser);
router.get("/get_deposit_history_by_user", depositHistoryByUser);
router.post("/deposit_USD_by_user", depositUSD);
router.post("/deposit_INR_by_user", depositINR);
router.post("/deposit_HPT_by_user", depositHPT);

router.put(
  "/change_password",
  updatePasswordValidators,
  updatePasswordValidationHandler,
  changePassword
);
router.put("/update_user_info", updateUserInfo);
router.put(
  "/update_email",
  updateEmailValidators,
  updateEmailValidationHandler,
  updateEmail
);
router.post("/withdraw", withdrawAmountValidators, withdrawAmount);
router.get("/get_withdraw_history", withdrawHistory);
router.get("/test_api", testAPI);
// new endpoint
router.post("/create_stake", stakingValidation, createStakingAmount);
router.get("/get_stake_history", getStakeHistory);
router.post("/create_unstake", unStakingValidation, createUnStakeAmount);
router.get("/get_my_team_info", getMyTeamInfo);
router.get("/get_team_levels_info", getTeamLevelsInfo);
router.get("/get_team_levels_details", getTeamLevelDetails); // BASE_URL/secure/api/get_team_levels_details?level=1
router.get("/get_stats", getStatistics);
router.get("/get_withdraw_details", getWithdrawDetails);
router.put("/update_wallet", updateWallet);
router.get("/get_reward", getReward);
router.get("/get_system_wallet", getSystemWallet);
router.get("/get_wallet_details", getWalletDetails);
router.get("/get_dashboard_details", getdashboardDetails);
router.post("/create_fund_transfer", fundValidation, createFundTransfer);
router.get("/get_fundTransfer_history", getFundTransferHistory);
router.get("/received_fundTransfer_history", receivedFundTransferHistory);
router.post("/contactus_message", contactusValidators, createContactUs);
router.get("/get_contactus_history", getContactUsHistory);
router.get("/get_updates", getUpdates);
router.post("/create_support", multer.single("image"), createSupportTicket);
router.get("/get_support_history", getSupportHistory);
router.get("/get_promotional_scheme_image", getPromotionalSchemeController);
router.put("/upload_profile_pic", multer.single("image"), updateProfilePic);

router.get("/get_token_price", getTokenPirce)
router.get("/get_popup_image", getPopUpImg)


module.exports = router;
