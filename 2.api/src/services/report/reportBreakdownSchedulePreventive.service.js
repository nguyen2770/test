const {
    Breakdown,
    SchedulePreventiveModel,
} = require('../../models');

const getReportAssetMaintenanceRequest = async (startDate, endDate, options) => {
    const limit = Number(options.limit) || 10;
    const page = Number(options.page) || 1;
    const sortBy = options.sortBy || "type";
    const sortOrder = options.sortOrder === "asc" ? 1 : -1;
    const totalBreakdown = await Breakdown.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    const totalSchedulePreventive = await SchedulePreventiveModel.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    // Lấy Breakdown
    const breakdowns = await Breakdown.aggregate([
        {
            $match: {
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            },
        },
    ]);

    // Lấy SchedulePreventive
    const schedulePreventives = await SchedulePreventiveModel.aggregate([
        {
            $match: {
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            },
        },
        {
            $lookup: {
                from: "preventives",
                localField: "preventive",
                foreignField: "_id",
                as: "preventive"
            }
        },
        { $unwind: { path: "$preventive", preserveNullAndEmptyArrays: true } },
    ]);

    // Gộp dữ liệu và thêm field type
    const allRequests = [
        ...breakdowns.map((item) => ({ ...item, type: "breakdown" })),
        ...schedulePreventives.map((item) => ({ ...item, type: "schedulePreventive" })),
    ];

    // Sắp xếp
    allRequests.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortOrder === 1 ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortOrder === 1 ? 1 : -1;
        return 0;
    });

    // Tính tổng số bản ghi
    const totalResults = allRequests.length;

    // Phân trang
    const paginatedData = allRequests.slice((page - 1) * limit, page * limit);

    return {
        data: paginatedData,
        totalResults,
        currentPage: page,
        totalPages: Math.ceil(totalResults / limit),
        totalBreakdown,
        totalSchedulePreventive,
    };
};

module.exports = {
    getReportAssetMaintenanceRequest,
};
