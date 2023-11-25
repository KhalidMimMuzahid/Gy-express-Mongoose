const express = require('express');
const { getAllLevelIncomeController, getRoiIncomeController, getRankIncomeController } = require('../../controller/private/earning.controller');
const router = express.Router();

router.get("/get_level_income", getAllLevelIncomeController);
router.get("/get_roi_income", getRoiIncomeController);
router.get("/get_rank_income", getRankIncomeController);

module.exports = router;