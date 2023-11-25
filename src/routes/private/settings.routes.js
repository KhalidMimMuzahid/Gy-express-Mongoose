const { changePassword, updateEmail, changePdfLink } = require("../../controller/private/setting.controller");

const router = require("express").Router();


router.put("/change_password", changePassword);
router.put("/update_email", updateEmail);
router.post("/change_pdf_link", changePdfLink);

module.exports = router;