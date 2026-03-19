const breakdownService = require('../common/breakdown.service');
const { AssetMaintenance } = require('../../models');
const { assetMaintenanceService } = require('..');

const getSummaryReportAssetPerformance = async (startDate, endDate, options) => {
    const limit = Number(options.limit) || 10;
    const page = Number(options.page) || 1;

    const searchAggregaates = [
        {
            $match: {
                customer: { $ne: null },
            },
        },
        {
            $addFields: {
                totalHoursAvailable: {
                    $divide: [
                        {
                            $subtract: [
                                new Date(endDate), // luôn đến endDate
                                {
                                    $cond: [
                                        {
                                            $and: [
                                                { $gt: ['$installationDate', new Date(startDate)] },
                                                { $lt: ['$installationDate', new Date(endDate)] },
                                                { $ne: ['$installationDate', null] },
                                            ],
                                        },
                                        '$installationDate',
                                        new Date(startDate),
                                    ],
                                },
                            ],
                        },
                        1,
                    ],
                },
            },
        },
        {
            $lookup: {
                from: 'breakdowns',
                let: { amId: '$_id' }, // biến tạm giữ AssetMaintenance._id
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$assetMaintenance', '$$amId'] },
                                    { $gte: ['$createdAt', new Date(startDate)] },
                                    { $lte: ['$createdAt', new Date(endDate)] },
                                ],
                            },
                        },
                    },
                ],
                as: 'breakdowns',
            },
        },
        {
            $lookup: {
                from: 'breakdownassignusercheckincheckouts',
                localField: 'breakdowns._id',
                foreignField: 'breakdown',
                as: 'checkins',
            },
        },
        {
            $addFields: {
                totalDowntimeCheckinCheckout: {
                    $sum: {
                        $map: {
                            input: '$checkins',
                            as: 'c',
                            in: { $subtract: ['$$c.logOutAt', '$$c.logInAt'] },
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                totalBreakdowns: { $size: '$breakdowns' },
            },
        },
        {
            $group: {
                _id: '$customer',
                assetMaintenanceIds: { $push: '$_id' },
                totalAssetmaintenances: { $sum: 1 },
                totalHoursAvailable: { $sum: '$totalHoursAvailable' },
                totalDowntimeCheckinCheckout: { $sum: '$totalDowntimeCheckinCheckout' },
                totalBreakdowns: { $sum: '$totalBreakdowns' },
            },
        },
        {
            $lookup: {
                from: 'customers',
                localField: '_id', // _id lúc này chính là customerId
                foreignField: '_id',
                as: 'customer',
            },
        },
        { $unwind: '$customer' },
    ];

    if (options.sortBy && options.sortOrder) {
        searchAggregaates.push({
            $sort: { [options.sortBy]: options.sortOrder },
        });
    }

    const pagzingAggregaates = [{ $skip: (page - 1) * limit }, { $limit: limit }];

    const assetMaintenanceSummarys = await AssetMaintenance.aggregate([...searchAggregaates, ...pagzingAggregaates]);
    for (const am of assetMaintenanceSummarys) {
        let downtime = 0;
        downtime = await assetMaintenanceService.calcularDowntimeOfAssetMaintenances(
            am.assetMaintenanceIds ,
            startDate,
            endDate
        );
        am.totalDowntime = downtime;
        am.totalAvailability =
            ((am.totalHoursAvailable * am.totalBreakdowns - downtime) / (am.totalHoursAvailable * am.totalBreakdowns)) * 100;
        am.totalMTTR = downtime / am.totalBreakdowns;
        am.totalMTBF = (am.totalHoursAvailable * am.totalBreakdowns - downtime) / (am.totalBreakdowns * am.totalBreakdowns);
    }
    const countAggregaates = [{ $count: 'totalResults' }];
    const totalResults = await AssetMaintenance.aggregate([...searchAggregaates, ...countAggregaates]);

    return {
        assetMaintenanceSummarys,
        totalResults: totalResults[0],
    };
};

const getDetailsReportAssetPerformance = async (startDate, endDate, options) => {
    const limit = Number(options.limit) || 10;
    const page = Number(options.page) || 1;

    const searchAggregaates = [
        {
            $lookup: {
                from: 'assetmodels',
                localField: 'assetModel',
                foreignField: '_id',
                as: 'assetModel',
            },
        },
        {
            $lookup: {
                from: 'assets',
                localField: 'asset',
                foreignField: '_id',
                as: 'asset',
            },
        },
        { $unwind: '$asset' },
        { $unwind: '$assetModel' },
        {
            $match: {
                customer: { $ne: null },
            },
        },
        {
            $addFields: {
                totalHoursAvailable: {
                    $divide: [
                        {
                            $subtract: [
                                new Date(endDate), // luôn đến endDate
                                {
                                    $cond: [
                                        {
                                            $and: [
                                                { $gt: ['$installationDate', new Date(startDate)] },
                                                { $lt: ['$installationDate', new Date(endDate)] },
                                                { $ne: ['$installationDate', null] },
                                            ],
                                        },
                                        '$installationDate',
                                        new Date(startDate),
                                    ],
                                },
                            ],
                        },
                        1,
                    ],
                },
            },
        },
        {
            $lookup: {
                from: 'breakdowns',
                let: { amId: '$_id' }, // biến tạm giữ AssetMaintenance._id
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$assetMaintenance', '$$amId'] },
                                    { $gte: ['$createdAt', new Date(startDate)] },
                                    { $lte: ['$createdAt', new Date(endDate)] },
                                ],
                            },
                        },
                    },
                ],
                as: 'breakdowns',
            },
        },
        {
            $lookup: {
                from: 'breakdownassignusercheckincheckouts',
                localField: 'breakdowns._id',
                foreignField: 'breakdown',
                as: 'checkins',
            },
        },
        {
            $addFields: {
                totalDowntimeCheckinCheckout: {
                    $sum: {
                        $map: {
                            input: '$checkins',
                            as: 'c',
                            in: { $subtract: ['$$c.logOutAt', '$$c.logInAt'] },
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                totalBreakdowns: { $size: '$breakdowns' },
            },
        },
    ];
    if (options.sortBy && options.sortOrder) {
        searchAggregaates.push({
            $sort: { [options.sortBy]: options.sortOrder },
        });
    }
    const pagzingAggregaates = [
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
    ];
    const assetMaintenances = await AssetMaintenance.aggregate([...searchAggregaates, ...pagzingAggregaates]);
    for (const am of assetMaintenances) {
        let downtime = 0;

        downtime = await assetMaintenanceService.calcularDowntimeOfAssetMaintenances(am._id, startDate, endDate);
        am.totalDowntime = downtime;
        am.totalAvailability =
            ((am.totalHoursAvailable * am.totalBreakdowns - downtime) / (am.totalHoursAvailable * am.totalBreakdowns)) * 100;
        am.totalMTTR = downtime / am.totalBreakdowns;
        am.totalMTBF = (am.totalHoursAvailable * am.totalBreakdowns - downtime) / (am.totalBreakdowns * am.totalBreakdowns);
    }
    const countAggregaates = [
        {
            $count: 'totalResults',
        },
    ];
    const totalResults = await AssetMaintenance.aggregate([...searchAggregaates, ...countAggregaates]);
    return {
        assetMaintenances,
        totalResults: totalResults[0],
    };
};
module.exports = {
    getSummaryReportAssetPerformance,
    getDetailsReportAssetPerformance,
};
