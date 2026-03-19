const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');
const { reportAssetMaintenanceService } = require('../../services');

const getSummaryReportAssetPerformance = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
    const { assetMaintenanceSummarys, totalResults } = await reportAssetMaintenanceService.getSummaryReportAssetPerformance(startDate, endDate, options);
    res.send({
        code: 1,
        ...totalResults,
        assetMaintenanceSummarys
    });
});
const getDetailsReportAssetPerformance = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
    const { assetMaintenances, totalResults } = await reportAssetMaintenanceService.getDetailsReportAssetPerformance(startDate, endDate, options);
    res.send({
        code: 1,
        ...totalResults,
        assetMaintenances
    });
});
module.exports = {
    getSummaryReportAssetPerformance,
    getDetailsReportAssetPerformance,
};
