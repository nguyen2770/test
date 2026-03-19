const express = require('express');

const auth = require('../../../middlewares/auth');
const { reportAssetMaintenanceController } = require('../../../controllers');

const router = express.Router();
router.get('/get-summary-report-asset-performance', auth('getSummaryReportAssetPerformance'), reportAssetMaintenanceController.getSummaryReportAssetPerformance);
router.get('/get-details-report-asset-performance', auth('getDetailsReportAssetPerformance'), reportAssetMaintenanceController.getDetailsReportAssetPerformance);

module.exports = router;

