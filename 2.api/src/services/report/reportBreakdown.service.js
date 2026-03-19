const breakdownService = require('../common/breakdown.service');
const { Breakdown, BreakdownAssignUserCheckinCheckOutModel, BreakdownAssignUserModel } = require('../../models');
const {
    ticketBreakdownStatus,
    breakdownStatus,
    assetMaintenanceStatus,
    reportView,
    breakdownAssignUserStatus,
} = require('../../utils/constant');

const getActivityReportBreakdown = async (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [counts] = await Breakdown.aggregate([
        {
            $match: { createdAt: { $gte: start, $lte: end } },
        },
        {
            $group: {
                _id: null,
                totalBreakdownNews: {
                    $sum: { $cond: [{ $eq: ['$ticketStatus', ticketBreakdownStatus.new] }, 1, 0] },
                },
                totalBreakdownInProgress: {
                    $sum: { $cond: [{ $eq: ['$ticketStatus', ticketBreakdownStatus.inProgress] }, 1, 0] },
                },
                totalBreakdownOverdues: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    {
                                        $in: [
                                            '$ticketStatus',
                                            [ticketBreakdownStatus.new, ticketBreakdownStatus.inProgress],
                                        ],
                                    },
                                    { $lt: ['$incidentDeadline', new Date()] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                totalBreakdownCompleted: {
                    $sum: { $cond: [{ $eq: ['$ticketStatus', ticketBreakdownStatus.completed] }, 1, 0] },
                },
                totalBreakdownClosed: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$ticketStatus', ticketBreakdownStatus.cloesed] },
                                    { $eq: ['$status', breakdownStatus.cloesed] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                totalBreakdownCancelled: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$ticketStatus', ticketBreakdownStatus.cloesed] },
                                    { $eq: ['$status', breakdownStatus.cancelled] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                totalBreakdownIsNotActives: {
                    $sum: { $cond: [{ $eq: ['$assetMaintenanceStatus', assetMaintenanceStatus.isNotActive] }, 1, 0] },
                },
                totalBreakdownIsActives: {
                    $sum: { $cond: [{ $eq: ['$assetMaintenanceStatus', assetMaintenanceStatus.isActive] }, 1, 0] },
                },
                totalAllBreakdowns: { $sum: 1 },
                totalDownTimeBreakdown: { $sum: '$downTimeMilis' }, // nếu đã lưu sẵn downtime
            },
        },
    ]);

    // Nếu vẫn cần downtime tính bằng workingTimeBreakdown:
    const activeBreakdowns = await Breakdown.find({
        createdAt: { $gte: start, $lte: end },
        status: { $ne: breakdownStatus.cancelled },
    }).select('_id');
    const totalDownTimeBreakdown = await breakdownService.workingTimeBreakdowns(activeBreakdowns.map((b) => b._id));

    return {
        ...counts,
        totalDownTimeBreakdown,
    };
};

const getListBreakdownActivity = async (startDate, endDate, options, _reportView) => {
    const limit = Number(options.limit) || 10;
    const page = Number(options.page) || 1;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (_reportView === reportView.summary) {
        const basePipeline = [
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: {
                        customer: '$customer',
                        priorityLevel: '$priorityLevel',
                    },
                    breakdownIds: { $push: '$_id' },
                    total: { $sum: 1 },
                    totalDownTimeMilis: { $sum: '$downTimeMilis' },
                },
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: '_id.customer',
                    foreignField: '_id',
                    as: 'customer',
                },
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        ];

        if (options.sortBy && options.sortOrder) {
            basePipeline.push({ $sort: { [options.sortBy]: options.sortOrder } });
        }

        const [groups, totalResultsArr] = await Promise.all([
            Breakdown.aggregate([...basePipeline, { $skip: (page - 1) * limit }, { $limit: limit }]),
            Breakdown.aggregate([...basePipeline, { $count: 'totalResults' }]),
        ]);

        const totalResults = totalResultsArr[0]?.totalResults || 0;
        const totalPages = Math.ceil(totalResults / limit);

        // Tính downtime động song song
        await Promise.all(
            groups.map(async (group) => {
                // const times = await Promise.all(
                //     group.breakdownIds.map(id => breakdownService.workingTimeBreakdown(id))
                // );
                // group.downtime = times.reduce((s, t) => s + t.time, 0);
                group.downtime = await breakdownService.workingTimeBreakdowns(group.breakdownIds.map((id) => id));
            })
        );
        return { results: groups, page, limit, totalPages, totalResults };
    }

    // Chi tiết
    return Breakdown.paginate(
        { createdAt: { $gte: start, $lte: end } },
        { ...options, populate: [{ path: 'customer' }, { path: 'createdBy' }] }
    );
};

const getAllBreakdownAssignUserStatus = async (startDate, endDate) => {
    const totalBreakdownAssignUsers = await BreakdownAssignUserModel.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    const totalBreakdownAssignUserStatusNews = await BreakdownAssignUserModel.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: {
            $in: [breakdownAssignUserStatus.reopen, breakdownAssignUserStatus.assigned, breakdownAssignUserStatus.accepted],
        },
    });
    const totalBreakdownAssignUserStatusInProgress = await BreakdownAssignUserModel.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: {
            $in: [
                breakdownAssignUserStatus.inProgress,
                breakdownAssignUserStatus.requestForSupport,
                breakdownAssignUserStatus.WCA,
                breakdownAssignUserStatus.reassignment,
                breakdownAssignUserStatus.experimentalFix,
                breakdownAssignUserStatus.pendingApproval,
                breakdownAssignUserStatus.approved,
                breakdownAssignUserStatus.submitted,
            ],
        },
    });
    const totalBreakdownAssignUserStatusRejecteds = await BreakdownAssignUserModel.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: breakdownAssignUserStatus.rejected,
    });
    const totalBreakdownAssignUserStatusCompleteds = await BreakdownAssignUserModel.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: breakdownAssignUserStatus.completed,
    });
    const totalBreakdownAssignUserStatusCloseds = await BreakdownAssignUserModel.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: {
            $in: [
                breakdownAssignUserStatus.cloesed,
                breakdownAssignUserStatus.cancelled,
                breakdownAssignUserStatus.replacement,
            ],
        },
    });
    const listBreakdownTotalTimeConsumed = await BreakdownAssignUserModel.aggregate([
        {
            $match: {
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                status: { $nin: [breakdownAssignUserStatus.cancelled] },
            },
        },
    ]);
    const totalConsumed = await BreakdownAssignUserCheckinCheckOutModel.aggregate([
        {
            $match: { breakdownAssignUser: { $in: listBreakdownTotalTimeConsumed.map((b) => b._id) } },
        },
        {
            $group: {
                _id: null,
                totalConsumed: {
                    $sum: {
                        $subtract: [
                            { $ifNull: ['$logOutAt', new Date()] }, // nếu không có logOutAt thì lấy giờ hiện tại
                            '$logInAt',
                        ],
                    },
                },
            },
        },
    ]);
    const totalConsumedMs = totalConsumed.length > 0 ? totalConsumed[0].totalConsumed : 0;
    return {
        totalBreakdownAssignUsers,
        totalBreakdownAssignUserStatusNews,
        totalBreakdownAssignUserStatusInProgress,
        totalBreakdownAssignUserStatusRejecteds,
        totalBreakdownAssignUserStatusCompleteds,
        totalBreakdownAssignUserStatusCloseds,
        totalConsumedMs,
    };
};
const getSummaryReportEngineerPerformanceInBreakdown = async (startDate, endDate, options) => {
    const allBreakdownAssignUserStatus = await getAllBreakdownAssignUserStatus(startDate, endDate);
    const limit = Number(options.limit) || 10;
    const page = Number(options.page) || 1;

    const searchAggregates = [
        {
            $match: {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            },
        },
    ];

    if (options.sortBy && options.sortOrder) {
        searchAggregates.push({
            $sort: { [options.sortBy]: options.sortOrder },
        });
    }

    const pagingAggregates = [{ $skip: (page - 1) * limit }, { $limit: limit }];

    const breakdownAssignUsers = await BreakdownAssignUserModel.aggregate([
        ...searchAggregates,
        {
            $group: {
                _id: '$user',
                assignUserIds: { $push: '$_id' }, // lưu danh sách BreakdownAssignUserId để join tính thời gian
                totalBreakdowns: { $sum: 1 },
                newCount: {
                    $sum: {
                        $cond: [
                            {
                                $in: [
                                    '$status',
                                    [breakdownStatus.reopen, breakdownStatus.assigned, breakdownStatus.accepted],
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                inProgressCount: {
                    $sum: {
                        $cond: [
                            {
                                $in: [
                                    '$status',
                                    [
                                        breakdownStatus.inProgress,
                                        breakdownStatus.requestForSupport,
                                        breakdownStatus.WCA,
                                        breakdownStatus.reassignment,
                                        breakdownStatus.experimentalFix,
                                        breakdownStatus.pendingApproval,
                                        breakdownStatus.approved,
                                        breakdownStatus.submitted,
                                    ],
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                rejectedCount: {
                    $sum: {
                        $cond: [{ $in: ['$status', [breakdownStatus.rejected]] }, 1, 0],
                    },
                },
                completedCount: {
                    $sum: {
                        $cond: [{ $in: ['$status', [breakdownStatus.completed]] }, 1, 0],
                    },
                },
                closedCount: {
                    $sum: {
                        $cond: [{ $in: ['$status', [breakdownStatus.cloesed, breakdownStatus.cancelled]] }, 1, 0],
                    },
                },
            },
        },
        {
            $lookup: {
                from: 'breakdownassignusercheckincheckouts', // bảng log checkin/checkout
                let: { assignUserIds: '$assignUserIds' },
                pipeline: [
                    { $match: { $expr: { $in: ['$breakdownAssignUser', '$$assignUserIds'] } } },
                    {
                        $group: {
                            _id: null,
                            totalUsageTime: {
                                $sum: {
                                    $subtract: [{ $ifNull: ['$logOutAt', new Date()] }, '$logInAt'],
                                },
                            },
                        },
                    },
                ],
                as: 'usageData',
            },
        },
        {
            $addFields: {
                totalUsageTime: {
                    $ifNull: [{ $arrayElemAt: ['$usageData.totalUsageTime', 0] }, 0],
                },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: '$user' },
        { $project: { usageData: 0, assignUserIds: 0 } }, // dọn dữ liệu phụ
        ...pagingAggregates,
    ]);

    const totalResults = await BreakdownAssignUserModel.aggregate([
        ...searchAggregates,
        { $group: { _id: '$user' } },
        { $count: 'totalResults' },
    ]);
    const count = totalResults.length > 0 ? totalResults[0].totalResults : 0;
    return {
        allBreakdownAssignUserStatus,
        breakdownAssignUsers,
        totalResults: count,
    };
};

const getDetailsReportEngineerPerformanceInBreakdown = async (startDate, endDate, options) => {
    const allBreakdownAssignUserStatus = await getAllBreakdownAssignUserStatus(startDate, endDate);
    const limit = Number(options.limit) || 10;
    const page = Number(options.page) || 1;

    const searchAggregaates = [
        {
            $match: {
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
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
    let breakdownAssignUsers = await BreakdownAssignUserModel.aggregate([...searchAggregaates, ...pagzingAggregaates]);
    breakdownAssignUsers = await BreakdownAssignUserModel.populate(breakdownAssignUsers, [
        { path: 'breakdown', populate: { path: 'createdBy' } },
        { path: 'user' },
    ]);

    const countAggregaates = [
        {
            $count: 'totalResults',
        },
    ];
    const totalResults = await BreakdownAssignUserModel.aggregate([...searchAggregaates, ...countAggregaates]);
    return {
        allBreakdownAssignUserStatus,
        breakdownAssignUsers,
        totalResults: totalResults[0],
    };
};
module.exports = {
    getActivityReportBreakdown,
    getListBreakdownActivity,
    getSummaryReportEngineerPerformanceInBreakdown,
    getAllBreakdownAssignUserStatus,
    getDetailsReportEngineerPerformanceInBreakdown,
};
