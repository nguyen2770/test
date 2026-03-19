const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { reportAssetDepreciationService } = require('../../services');
const ApiError = require('../../utils/ApiError');
const pick = require('../../utils/pick');

const getAssetDepreciationReport = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const filter = pick(req.query, ['assetName', 'serial', 'reportCutoffDate']);
    const { reports, totalPages, totalResults, page, limit } = await reportAssetDepreciationService.getAssetDepreciationReport(filter, options);
    res.send({
        code: 1,
        reports,
        page,
        limit,
        totalPages,
        totalResults,
    });
});

const getDetailAssetDepreciationReport = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const filter = pick(req.query, ['assetName', 'serial', 'reportCutoffYear']);
    const { reports, totalPages, totalResults, page, limit } = await reportAssetDepreciationService.getDetailAssetDepreciationReport(filter, options);
    res.send({
        code: 1,
        reports,
        page,
        limit,
        totalPages,
        totalResults,
    });
});


module.exports = {
    getAssetDepreciationReport,
    getDetailAssetDepreciationReport,
}