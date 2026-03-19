const express = require('express');

const auth = require('../../../middlewares/auth');
const { reportBreakdownController } = require('../../../controllers');

const router = express.Router();

router.get('/get-activity-report-breakdown', auth('getActivityReportBreakdown'), reportBreakdownController.getActivityReportBreakdown);
router.get('/get-details-report-engineer-performance-in-breakdown', auth('getDetailsReportEngineerPerformanceInBreakdown'), reportBreakdownController.getDetailsReportEngineerPerformanceInBreakdown);
router.get('/get-summary-report-engineer-performance-in-breakdown', auth('getSummaryReportEngineerPerformanceInBreakdown'), reportBreakdownController.getSummaryReportEngineerPerformanceInBreakdown);
module.exports = router;

