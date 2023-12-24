const {
  changePassword,
  updateEmail,
  changePdfLink,
  getWinningSharePercentage,
  updateWinningSharePercentage,
} = require("../../controller/private/setting.controller");

const router = require("express").Router();
router.put("/change_password", changePassword);
router.put("/update_email", updateEmail);
router.post("/change_pdf_link", changePdfLink);
router.get("/winning-share-percentage", getWinningSharePercentage);
router.patch("/winning-share-percentage", updateWinningSharePercentage);
module.exports = router;
