const {
  changePassword,
  updateEmail,
  changePdfLink,
  getWinningSharePercentage,
  updateWinningSharePercentage,
  updateRoiPercentage,
  getRoiPercentage,
  setMinimumDepositAmount,
  setMinimumWithdrawAmount,
  setWithdrawPercentage,
  getManageAmount,
} = require("../../controller/private/setting.controller");

const router = require("express").Router();
router.put("/change_password", changePassword);
router.put("/update_email", updateEmail);
router.post("/change_pdf_link", changePdfLink);
router.get("/winning-share-percentage", getWinningSharePercentage);
router.patch("/winning-share-percentage", updateWinningSharePercentage);
router.patch("/roi_percentage", updateRoiPercentage);
router.get("/roi_percentage", getRoiPercentage);
router.post("/manage_deposite_amount", setMinimumDepositAmount);
router.post("/manage_withdarw_amount", setMinimumWithdrawAmount);
router.post("/manage_withdarw_percentage_amount", setWithdrawPercentage);
router.get("/get_manage_amount", getManageAmount);
module.exports = router;
