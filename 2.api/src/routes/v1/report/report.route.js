const express = require('express');
const reportController = require('../../../controllers/report/report.controller');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.get('/get-breakdown-chart', auth('getBreakdownChart'), reportController.getBreakdownChart);
router.get(
    '/get-schedule-preventive-chart',
    auth('getSchedulePreventiveChart'),
    reportController.getSchedulePreventiveChart
);
router.get('/get-approve-work', auth('getApproveWorks'), reportController.getApproveWorks);
router.get(
    '/get-schedule-preventive-compliance',
    auth('getSchedulePreventiveCompliance'),
    reportController.getSchedulePreventiveCompliance
);
router.get('/get-breakdown-compliance', auth('getBreakdownCompliance'), reportController.getBreakdownCompliance);
router.get('/get-upTime-assetMaintenance', auth('getUpTimeAssetMaintenance'), reportController.getUpTimeAssetMaintenance);
router.get(
    '/get-schedule-preventive-vs-assignUser',
    auth('getSchedulePreventiveVsAssignUser'),
    reportController.getSchedulePreventiveVsAssignUser
);
router.get(
    '/get-average-response-time',
    auth('getAverageResponseTimeBreakdown'),
    reportController.getAverageResponseTimeBreakdown
);
router.get(
    '/get-average-resolution-time',
    auth('getAverageResolutionTimeBreakdown'),
    reportController.getAverageResolutionTimeBreakdown
);
router.patch(
    '/compare-status-schedule-preventive-and-breakdown-by-customer',
    auth('compareStatusSchedulePreventiveAndBreakdownByCustomer'),
    reportController.compareStatusSchedulePreventiveAndBreakdownByCustomer
);
router.get('/get-data-kpb-indicators', auth('getDataKPBIndicators'), reportController.getDataKPBIndicators);
router.get('/total-operational-metrics', auth('totalOperationalMetrics'), reportController.totalOperationalMetrics);
router.get('/get-spare-movement', auth('spareMovementReport'), reportController.spareMovementReport);
router.get('/get-spare-usage-summary', auth('sparePartsUsageSummaryReport'), reportController.sparePartsUsageSummaryReport);
router.get('/get-assetMaintenance-report', auth('getAssetMaintenanceReport'), reportController.getAssetMaintenanceReport);
router.get('/get-my-task-calender', auth('getMyTaskCalender'), reportController.getMyTaskCalender);
router.get('/get-my-ticket-calender', auth('getMyTicketCalender'), reportController.getMyTicketCalender);
router.patch('/update-approval-task-status-processed', auth('updateApprovalTaskStatusProcessed'), reportController.updateApprovalTaskStatusProcessed)
module.exports = router;
