const express = require('express');
const getAllContactUsHistory = require('../../controller/private/contactus.controller');
const getAllSupportHistory = require('../../controller/private/support.controller');
const router = express.Router();

router.get("/get_all_contactus", getAllContactUsHistory);
router.get("/get_all_support", getAllSupportHistory);

module.exports = router;