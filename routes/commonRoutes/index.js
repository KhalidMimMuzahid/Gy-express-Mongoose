const express = require("express");
const {
  getUserInfo,
  getPopUpImg,
  getSystemWallet,
  getPdfLink,
} = require("../../controllers/commonControllers");
const { verifyJWT } = require("../../middleware/authMiddleware");
const router = express.Router();

router.use(verifyJWT);

router.get("/get_system_wallet", getSystemWallet);
router.get("/get_user", getUserInfo);
router.get("/get_popup_img", getPopUpImg);
router.get("/get_pdf_link", getPdfLink);
module.exports = router;
