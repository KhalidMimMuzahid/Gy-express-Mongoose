const express = require("express");
const {
  showAllWithdraw,
  getSuccessfulWithdraws,
  getRejectedWithdraws,
  updateWithdrawStatus,
} = require("../../controller/private/withdraw.controller");
const {
  uploadRewardImage,
} = require("../../controller/private/rewardImage.controller");
const router = express.Router();

router.get("/show_all_withdraw", showAllWithdraw);
router.get("/get_success_withdraw", getSuccessfulWithdraws);
router.get("/get_rejected_withdraw", getRejectedWithdraws);
router.put("/update_withdraw_status", updateWithdrawStatus);
router.put("/upload_reward_image", uploadRewardImage);

module.exports = router;
