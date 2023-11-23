const express = require("express");
const {
  getBlockedUser,
  changeUserStatus,
  changePassword,
  updateEmail,
  deleteUser,
  editUser,
  approveDepositRequestByAdmin,
  getDashboardData,
  getAllUser,
  getAllActiveUser,
  updatePopUpImage,
  updateSystemWalletAPI,
  swapHistoryByAdmin,
  getAllDepositByAdmin,
  allWithdrawHistory,
  successWithdrawHistory,
  rejectWithdrawHistory,
  changeWithdrawStatus,
  createFundTransfer,
  getAllFundTransferHistory,
  getAllStakingHistory,
  getAllStakingLevelEarning,
  getAllStakeSelfEarning,
  getAllPromotionalScheme,
  uploadPromotionalSchemeImage,
  deletePromotionalSchemeImage,
  getAllContactUsHistory,
  getAllSupportHistory,
  createUpdate,
  changePdfLink,
  getAllDirectReward,
  createTokenPrice,
  updateTokenPirce,
  getTokenPirce,
  deleteTokenPrice,
  changePopUpImg,
} = require("../../controllers/privateControllers");
const { verifyJWT, verifyAdmin } = require("../../middleware/authMiddleware");
const {
  updatePasswordValidators,
  updateEmailValidators,
  updateEmailValidationHandler,
  updatePasswordValidationHandler,
} = require("../../validation/inputValidation");
const { fundValidation } = require("../../validation/fundTransferValidation");
const multer = require("../../middleware/multer");
const router = express.Router();
const middleware = [verifyJWT, verifyAdmin];
router.use(middleware);

router.get("/get_swap_history_by_admin", swapHistoryByAdmin);
router.put("/update_system_wallet_by_admin", updateSystemWalletAPI);
router.post("/deposit_request_approve_by_admin", approveDepositRequestByAdmin); // ok
router.get("/get_deposit_history_by_admin", getAllDepositByAdmin); // ok
router.put("/update_pop_up_image_by_admin", updatePopUpImage);
router.get("/get_dashboard_data", getDashboardData); // ok
router.get("/get_all_active_user_list", getAllActiveUser); // ok
router.get("/get_all_user_list", getAllUser); // ok
router.get("/block_user_list", getBlockedUser); // ok
router.put("/change_user_status", changeUserStatus);
router.put("/delete_user", deleteUser);
router.put("/edit_user", editUser);
router.get("/all_withdraw_history", allWithdrawHistory);
router.get("/success_withdraw_history", successWithdrawHistory);
router.get("/reject_withdraw_history", rejectWithdrawHistory);
router.put("/change_withdraw_status", changeWithdrawStatus);
router.post("/create_admin_fund_transfer", fundValidation, createFundTransfer);
router.get("/get_all_fundtransfer_history", getAllFundTransferHistory);
router.get("/get_all_stake_history", getAllStakingHistory);
router.get("/get_all_stake_level_earning_history", getAllStakingLevelEarning);
router.get("/get_all_stake_self_earning_history", getAllStakeSelfEarning);
router.get("/get_all_promotional_scheme", getAllPromotionalScheme);
router.post("/upload_promotional_scheme_image", multer.array("image", 6), uploadPromotionalSchemeImage);
router.delete("/delete_promotional_scheme_image", deletePromotionalSchemeImage);
router.get("/get_all_contact_history", getAllContactUsHistory);
router.get("/get_all_support", getAllSupportHistory);
router.post("/create_updates", createUpdate);
router.post("/change_pdf_link", changePdfLink);
router.get("/get_all_direct_reward", getAllDirectReward)
router.put(
  "/change_password",
  updatePasswordValidators,
  updatePasswordValidationHandler,
  changePassword
);
router.put(
  "/update_email",
  updateEmailValidators,
  updateEmailValidationHandler,
  updateEmail
);
router.post("/create_token_price", createTokenPrice)
router.put("/update_token_price", updateTokenPirce)
router.get("/get_token_price", getTokenPirce)
router.delete("/delect_token_price", deleteTokenPrice);
router.post("/change_popup_img", multer.single("image"), changePopUpImg);
router.delete("/delect_token_price", deleteTokenPrice)


module.exports = router;
