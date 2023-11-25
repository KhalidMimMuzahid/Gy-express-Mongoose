const express = require("express");
const {getAdminDashboardStatsController} = require("../../controller/private/dashboard.controller");
const router = express.Router();

router.get("/get_admin_dashboard_data", getAdminDashboardStatsController);

module.exports = router;
