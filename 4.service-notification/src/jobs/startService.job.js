const calibrationService = require("../services/calibration/calibration.service");
const schedulePreventiveService = require("../services/preventive/schedulePreventive.service");
const breakdownService = require("../services/breakdown/breakdown.service");
const assetMaintenanceService = require("../services/assetMaintenance/assetMaintenance.service");
const startServiceJob = async () => {
  try {
    // await calibrationService.handleCalibrationIssues();
    await assetMaintenanceService.partsReplacementNotice();
    // await schedulePreventiveService.prevetiveNotification();
    // await breakdownService.overdueBreakdown();
  } catch (error) {
    console.error("❌ Calibration job error (initial run):", error);
  }
};
module.exports = {
  startServiceJob,
};
