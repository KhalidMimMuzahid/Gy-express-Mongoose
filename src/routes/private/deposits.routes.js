const express = require("express");
const {
  showAllDeposits,
  showSuccessDeposits,
  showRejectedDeposits,
  updateDepositStatus,
} = require("../../controller/private/deposits.controller");
const router = express.Router();

router.get("/get_all_deposits", showAllDeposits);
router.get("/get_success_deposits", showSuccessDeposits);
router.get("/get_rejected_deposits", showRejectedDeposits);
router.put("/update_deposit_status", updateDepositStatus);

module.exports = router;
