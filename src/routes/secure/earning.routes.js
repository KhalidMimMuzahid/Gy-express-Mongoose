const router = require("express").Router()
const {
  getLevelIncome,
  getGameWalletIncome,
  getRoiIncome,
  getRankIncome,
  getMyWinningAmount,
} = require("../../controller/secure/earning.controller");

router.get("/get_level_income", getLevelIncome);
router.get("/get_game_wallet_income", getGameWalletIncome);
router.get("/get_roi_income", getRoiIncome);
router.get("/get_rank_income", getRankIncome);
router.get("/my-winning-amount", getMyWinningAmount);



module.exports = router;