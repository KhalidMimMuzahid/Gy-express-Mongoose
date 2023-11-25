const router = require("express").Router()
const { getLevelIncome, getRoiIncome, getRankIncome } = require("../../controller/secure/earning.controller");


router.get("/get_level_income", getLevelIncome);
router.get("/get_roi_income", getRoiIncome);
router.get("/get_rank_income", getRankIncome);

module.exports = router;