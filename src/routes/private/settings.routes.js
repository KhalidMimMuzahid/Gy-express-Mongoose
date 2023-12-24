const {
  changePassword,
  updateEmail,
  changePdfLink,
  getWinningSharePercentage,
  updateWinningSharePercentage,
  updateRoiPercentage,
  getRoiPercentage,
} = require("../../controller/private/setting.controller");

const router = require("express").Router();
router.put("/change_password", changePassword);
router.put("/update_email", updateEmail);
router.post("/change_pdf_link", changePdfLink);
router.get("/winning-share-percentage", getWinningSharePercentage);
router.patch("/winning-share-percentage", updateWinningSharePercentage);
router.patch("/roi_percentage", updateRoiPercentage);
router.get("/roi_percentage", getRoiPercentage);
module.exports = router;
