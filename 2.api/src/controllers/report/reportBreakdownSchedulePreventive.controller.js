const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');
const { reportBreakdownSchedulePreventiveService } = require('../../services');

const getReportAssetMaintenanceRequest = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
    const data = await reportBreakdownSchedulePreventiveService.getReportAssetMaintenanceRequest(startDate, endDate, options);
    res.send({
        code: 1,
        ...data
    });
});

module.exports = {
    getReportAssetMaintenanceRequest,

};
