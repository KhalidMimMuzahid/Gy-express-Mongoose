const {
  getUserInfo,
  updateUserInfo,
  changePassword,
  updateEmail,
  updateTrxAddress,
  upLoadProofPic,
  updateProfilePic,
  addOrUpdateBank,
  getBank,
  createKycApi,
  getKycApi,
  getKycSuccess,
} = require("../../controller/secure/profile.controller");

const router = require("express").Router();

router.get("/user/get_user", getUserInfo); // view profile
router.put("/user/update_user_info", updateUserInfo); // update user
router.put("/user/update_email", updateEmail); // update email
router.put("/user/change_password", changePassword); // change password
router.put("/user/update_trx_address", updateTrxAddress); // update trx address
router.put("/user/upload_profile_pic", updateProfilePic);
router.put("/user/add-bank", addOrUpdateBank); 
router.get("/user/get-bank", getBank);
router.post("/user/create-kyc",createKycApi);
router.get("/user/get-kyc",getKycApi);
router.get("/user/get-kyc-success-status",getKycSuccess);

module.exports = router;
