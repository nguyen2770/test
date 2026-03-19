const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const {
    CalibrationWorkModel,
    CalibrationWorkAssignUserModel,
    CalibrationWorkCheckinCheckOutModel,
    CalibrationAttachmentModel,
    CalibrationWorkHistoryModel,
    CalibrationAssignUserModel,
    AssetMaintenanceIsNotActiveHistoryModel,
    CalibrationWorkCommentModel,
    User,
    AssetMaintenance,
} = require('../../models');
const {
    calibrationWorkAssignUserStatus,
    calibrationWorkStatus,
    calibrationWorkGroupStatus,
    approvedTaskType,
} = require('../../utils/constant');
const { sequenceService, assetMaintenanceIsNotActiveHistoryService, schedulePreventiveService } = require('..');
const { getCalibrationById } = require('./calibration.service');

const createCalibrationWork = async (data) => {
    const calibrationWork = await CalibrationWorkModel.create(data);
    return calibrationWork;
};
const queryCalibrationWorks = async (filter, options) => {
    const calibrationFilter = filter;
    const calibrationMatch = {};
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (filter.searchText) {
        const regex = { $regex: filter.searchText, $options: 'i' };
        calibrationMatch.$or = [
            { code: regex },
            { calibrationName: regex },
            { 'assetMaintenance.serial': regex },
            { 'assetMaintenance.assetModel.asset.assetName': regex },
            { 'assetMaintenance.assetModel.assetModelName': regex },
        ];
        delete calibrationFilter.searchText;
    }

    if (filter.code) {
        calibrationFilter.code = { $regex: filter.code, $options: 'i' };
    }
    if (filter.calibrationName) {
        calibrationFilter.calibrationName = { $regex: filter.calibrationName, $options: 'i' };
    }
    // --- Bộ lọc theo groupStatus ---
    if (filter.groupStatus) {
        const twoDaysLater = new Date();
        twoDaysLater.setDate(twoDaysLater.getDate() + 2);
        switch (filter.groupStatus) {
            case calibrationWorkGroupStatus.upcoming:
                calibrationMatch['startDate'] = { $gt: endOfToday };
                calibrationFilter.groupStatus = { $in: [calibrationWorkGroupStatus.new] };
                break;

            case calibrationWorkGroupStatus.new:
                calibrationMatch['startDate'] = { $lte: twoDaysLater };
                calibrationFilter.groupStatus = filter.groupStatus;
                break;
            case calibrationWorkGroupStatus.inProgress:
                calibrationFilter.groupStatus = filter.groupStatus;
                break;
            case calibrationWorkGroupStatus.overdue:
                calibrationMatch['startDate'] = { $lte: endOfToday };
                calibrationFilter.groupStatus = {
                    $in: [calibrationWorkGroupStatus.new, calibrationWorkGroupStatus.inProgress],
                };
                break;

            default:
                break;
        }
    }
    if (filter.startDate || filter.endDate) {
        const range = {};
        if (filter.startDate) range.$gte = new Date(filter.startDate);
        if (filter.endDate) range.$lte = new Date(filter.endDate);
        calibrationMatch['startDate'] = range;
        delete filter.startDate;
        delete filter.endDate;
    }
    if (filter.status) {
        calibrationFilter.status = filter.status;
    }
    if (filter.importance) {
        calibrationFilter.importance = filter.importance;
    }
    if (filter.serial) {
        calibrationMatch['assetMaintenance.serial'] = {
            $regex: filter.serial,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.serial;
    }

    if (filter.assetStyle) {
        calibrationMatch['assetMaintenance.assetStyle'] = filter.assetStyle;
        delete filter.assetStyle;
    }
    if (filter.assetModelName) {
        calibrationMatch['assetMaintenance.assetModel.assetModelName'] = {
            $regex: filter.assetModelName,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.assetModelName;
    }
    if (filter.assetName) {
        calibrationMatch['assetMaintenance.assetModel.asset.assetName'] = {
            $regex: filter.assetName,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.assetName;
    }
    const searchAggregaates = [
        {
            $match: calibrationFilter,
        },
        {
            $lookup: {
                from: 'assetmaintenances',
                localField: 'assetMaintenance',
                foreignField: '_id',
                as: 'assetMaintenance',
                pipeline: [
                    {
                        $lookup: {
                            from: 'assetmodels',
                            localField: 'assetModel',
                            foreignField: '_id',
                            as: 'assetModel',
                            pipeline: [
                                {
                                    $lookup: {
                                        from: 'assets',
                                        localField: 'asset',
                                        foreignField: '_id',
                                        as: 'asset',
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'categorys',
                                        localField: 'category',
                                        foreignField: '_id',
                                        as: 'category',
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'manufacturers',
                                        localField: 'manufacturer',
                                        foreignField: '_id',
                                        as: 'manufacturer',
                                    },
                                },
                                { $unwind: { path: '$asset', preserveNullAndEmptyArrays: true } },
                                { $unwind: { path: '$manufacturer', preserveNullAndEmptyArrays: true } },
                                { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'customers',
                            localField: 'customer',
                            foreignField: '_id',
                            as: 'customer',
                        },
                    },
                    { $unwind: { path: '$assetModel', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
                ],
            },
        },
        {
            $lookup: {
                from: 'calibrationcontracts',
                localField: 'calibrationContract',
                foreignField: '_id',
                as: 'calibrationContract',
            },
        },
        { $unwind: { path: '$assetMaintenance', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$calibrationContract', preserveNullAndEmptyArrays: true } },
        { $match: calibrationMatch },
    ];
    if (options.sortBy && options.sortOrder) {
        searchAggregaates.push({
            $sort: { [options.sortBy]: Number(options.sortOrder) },
        });
    }
    const pagzingAggregaates = [
        {
            $skip: (options.page - 1) * options.limit,
        },
        {
            $limit: options.limit,
        },
    ];
    const calibrations = await CalibrationWorkModel.aggregate([...searchAggregaates, ...pagzingAggregaates]);
    const countAggregaates = [
        {
            $count: 'totalResults',
        },
    ];
    const totalResults = await CalibrationWorkModel.aggregate([...searchAggregaates, ...countAggregaates]);
    return {
        calibrations,
        totalResults: totalResults[0],
    };
};
const getCalibrationWorkAssignUserByRes = async (res) => {
    const calibrationAssignUsers = await CalibrationWorkAssignUserModel.find(res).populate([
        { path: 'user', populate: [{ path: 'role' }, { path: 'branch' }] },
        { path: 'calibration' },
    ]);
    return calibrationAssignUsers;
};
const comfirmCancelCalibrationWorkById = async (id) => {
    const calibrationWork = await CalibrationWorkModel.findById(id);
    if (!calibrationWork) {
        throw new Error('calibrationWork not found');
    }
    await CalibrationWorkAssignUserModel.updateMany(
        {
            calibrationWork: calibrationWork?._id,
            status: { $nin: [calibrationWorkAssignUserStatus.replacement] },
        },
        {
            $set: {
                status: calibrationWorkAssignUserStatus.cancelled,
            },
        }
    );
    calibrationWork.status = calibrationWorkStatus.cancelled;
    calibrationWork.groupStatus = calibrationWorkGroupStatus.history;
    calibrationWork.cancelConfirmDate = new Date();
    calibrationWork.save();
    return calibrationWork;
};
const deleteCalibrationWorkById = async (id) => {
    const calibrationWork = await CalibrationWorkModel.findById(id);
    if (!calibrationWork) {
        throw new Error('calibrationWork not found');
    }
    if (calibrationWork.status !== calibrationWorkStatus.new) {
        throw new Error('calibrationWork đang được sử dụng');
    }
    await CalibrationWorkAssignUserModel.deleteMany({ calibrationWork: calibrationWork?._id });
    calibrationWork.remove();
    return calibrationWork;
};
const createCalibrationWorkAssignUser = async (user, calibrationWork) => {
    const calibrationWorkAssignUsers = await CalibrationWorkAssignUserModel.find({ calibrationWork });
    if (calibrationWorkAssignUsers && calibrationWorkAssignUsers.length > 0) {
        throw new Error('Công việc hiệu chuẩn này đã được giao');
    }
    await CalibrationWorkAssignUserModel.create({ user, calibrationWork });
};
const reassignmentCalibrationWorkAssignUser = async (user, oldUser, calibrationWork) => {
    const calibrationWorkAssignUsers = await CalibrationWorkAssignUserModel.find({ calibrationWork, oldUser });
    if (
        !calibrationWorkAssignUsers ||
        calibrationWorkAssignUsers.status === calibrationWorkAssignUserStatus.replacement ||
        calibrationWorkAssignUsers.status === calibrationWorkAssignUserStatus.cancelled ||
        calibrationWorkAssignUsers.status === calibrationWorkAssignUserStatus.completed
    ) {
        throw new Error('User không thuộc trạng thái phân công');
    }
    // nếu kỹ sư cũ đang đăng nhập thì logout
    const calibrationWorkCheckinCheckOutLast = await CalibrationWorkCheckinCheckOutModel.findOne({
        calibrationWork: calibrationWork,
        user: oldUser,
        checkOutDateTime: null,
    });
    if (calibrationWorkCheckinCheckOutLast) {
        calibrationWorkCheckinCheckOutLast.checkOutDateTime = new Date();
        await calibrationWorkCheckinCheckOutLast.save();
    }

    if (mongoose.Types.ObjectId(user) === mongoose.Types.ObjectId(oldUser)) {
        const calibrationWorkAssignUser = await CalibrationWorkAssignUserModel.findOneAndUpdate(
            { user, calibrationWork },
            { status: calibrationWorkAssignUserStatus.assigned }
        );
        return calibrationWorkAssignUser;
    } else {
        const data = await CalibrationWorkAssignUserModel.findOneAndUpdate(
            { user: oldUser, calibrationWork }, // điều kiện tìm
            { $set: { status: calibrationWorkAssignUserStatus.replacement } },
            { new: true } // ✅ trả về bản ghi sau khi update
        );
        let calibrationWorkAssignUser = await CalibrationWorkAssignUserModel.findOne({ user, calibrationWork });
        if (calibrationWorkAssignUser) {
            calibrationWorkAssignUser.status = calibrationWorkAssignUserStatus.assigned;
            calibrationWorkAssignUser.save();
        } else {
            calibrationWorkAssignUser = await CalibrationWorkAssignUserModel.create({ user, calibrationWork });
        }
        return calibrationWorkAssignUser;
    }
};
const getCalibrationWorkById = async (id) => {
    const calibrationWork = await CalibrationWorkModel.findById(id).populate([
        {
            path: 'calibration',
        },
        {
            path: 'assetMaintenance',
            populate: [
                {
                    path: 'assetModel',
                    populate: [
                        {
                            path: 'asset',
                        },
                        { path: 'category' },
                        { path: 'manufacturer' },
                    ],
                },
                { path: 'customer' },
            ],
        },
        {
            path: 'calibrationContract',
        },
    ]);
    if (!calibrationWork) {
        throw new Error('calibrationWork not found');
    }
    return calibrationWork;
};
const getCalibrationWorkByIdNotPopulate = async (id) => {
    const calibrationWork = await CalibrationWorkModel.findById(id);
    if (!calibrationWork) {
        throw new Error('calibrationWork not found');
    }
    return calibrationWork;
};
const queryMyCalibrationWorks = async (filter, options, user) => {
    const myCalibrationWorkFilter = filter;
    const calibrationWorkMatch = {};
    if (user) {
        myCalibrationWorkFilter.user = mongoose.Types.ObjectId(user);
    }
    if (filter.searchText) {
        const regex = { $regex: filter.searchText, $options: 'i' };
        calibrationWorkMatch.$or = [
            { 'calibrationWork.calibrationName': regex },
            { 'calibrationWork.code': regex },
            { 'calibrationWork.assetMaintenance.serial': regex },
            { 'calibrationWork.assetMaintenance.assetModel.asset.assetName': regex },
            { 'calibrationWork.assetMaintenance.assetModel.assetModelName': regex },
        ];
        delete myCalibrationWorkFilter.searchText;
    }
    if (filter.calibrationName) {
        calibrationWorkMatch['calibrationWork.calibrationName'] = {
            $regex: filter.calibrationName,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.calibrationName;
    }
    if (filter.startDate || filter.endDate) {
        const range = {};
        if (filter.startDate) range.$gte = new Date(filter.startDate);
        if (filter.endDate) range.$lte = new Date(filter.endDate);
        calibrationWorkMatch['startDate'] = range;
        delete filter.startDate;
        delete filter.endDate;
    }
    if (filter.calibrationWorkAssignUserStatuses) {
        myCalibrationWorkFilter.status = { $in: filter.calibrationWorkAssignUserStatuses };
    }
    if (filter.calibrationWorkAssignUserStatus) {
        myCalibrationWorkFilter.status = filter.calibrationWorkAssignUserStatus;
        delete filter.calibrationWorkAssignUserStatus;
    }
    if (filter.code) {
        calibrationWorkMatch['calibrationWork.code'] = {
            $regex: filter.code,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.code;
    }
    if (filter.importance) {
        calibrationWorkMatch['calibrationWork.importance'] = filter.importance;
        delete filter.importance;
    }
    if (filter.serial) {
        calibrationWorkMatch['calibrationWork.assetMaintenance.serial'] = {
            $regex: filter.serial,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.serial;
    }
    if (filter.assetName) {
        calibrationWorkMatch['calibrationWork.assetMaintenance.assetModel.asset.assetName'] = {
            $regex: filter.assetName,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.assetName;
    }
    if (filter.assetModelName) {
        calibrationWorkMatch['calibrationWork.assetMaintenance.assetModel.assetModelName'] = {
            $regex: filter.assetModelName,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.assetModelName;
    }
    if (filter.branchs) {
        const _branchs = filter.branchs.map((_b) => mongoose.Types.ObjectId(_b));
        calibrationWorkMatch['calibrationWork.assetMaintenance.branch'] = {
            $in: _branchs,
        };
    }
    delete filter.branchs;
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    switch (filter.calibrationWorkAssignUserGroupStatus) {
        case calibrationWorkGroupStatus.upcoming:
            calibrationWorkMatch['calibrationWork.startDate'] = {
                $gt: endOfToday,
            };
            break;
        case calibrationWorkGroupStatus.new:
        case calibrationWorkGroupStatus.inProgress:
            const twoDaysLater = new Date();
            twoDaysLater.setDate(twoDaysLater.getDate() + 2); // đang cộng thêm 2 ngày
            calibrationWorkMatch['calibrationWork.startDate'] = {
                $lte: twoDaysLater,
            };
            break;
        case calibrationWorkGroupStatus.overdue:
            calibrationWorkMatch['calibrationWork.startDate'] = {
                $lte: endOfToday,
            };
            break;
        default:
            break;
    }

    delete filter.calibrationWorkAssignUserStatuses;
    delete filter.calibrationWorkAssignUserGroupStatus;
    const searchAggregaates = [
        {
            $match: myCalibrationWorkFilter,
        },
        {
            $lookup: {
                from: 'assetmaintenances',
                localField: 'calibrationWork.assetMaintenance',
                foreignField: '_id',
                as: 'assetMaintenance',
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $lookup: {
                from: 'calibrationworks',
                localField: 'calibrationWork',
                foreignField: '_id',
                as: 'calibrationWork',
                pipeline: [
                    {
                        $lookup: {
                            from: 'assetmaintenances',
                            localField: 'assetMaintenance',
                            foreignField: '_id',
                            as: 'assetMaintenance',
                            pipeline: [
                                {
                                    $lookup: {
                                        from: 'assetmodels',
                                        localField: 'assetModel',
                                        foreignField: '_id',
                                        as: 'assetModel',
                                        pipeline: [
                                            {
                                                $lookup: {
                                                    from: 'assets',
                                                    localField: 'asset',
                                                    foreignField: '_id',
                                                    as: 'asset',
                                                },
                                            },
                                            { $unwind: { path: '$asset', preserveNullAndEmptyArrays: true } },
                                        ],
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'customers',
                                        localField: 'customer',
                                        foreignField: '_id',
                                        as: 'customer',
                                    },
                                },
                                { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
                                { $unwind: { path: '$assetModel', preserveNullAndEmptyArrays: true } },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'calibrations',
                            localField: 'calibration',
                            foreignField: '_id',
                            as: 'calibration',
                        },
                    },
                    {
                        $lookup: {
                            from: 'calibrationcontracts',
                            localField: 'calibrationContract',
                            foreignField: '_id',
                            as: 'calibrationContract',
                        },
                    },
                    { $unwind: { path: '$calibrationContract', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$calibration', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$assetMaintenance', preserveNullAndEmptyArrays: true } },
                ],
            },
        },
        { $unwind: { path: '$assetMaintenance', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$calibrationWork', preserveNullAndEmptyArrays: false } },
        {
            $addFields: {
                startDate: '$calibrationWork.startDate',
            },
        },
        { $match: calibrationWorkMatch },
    ];
    if (options.sortBy && options.sortOrder) {
        searchAggregaates.push({
            $sort: { [options.sortBy]: options.sortOrder },
        });
    }
    const pagzingAggregaates = [
        {
            $skip: (options.page - 1) * options.limit,
        },
        {
            $limit: options.limit,
        },
    ];
    const myCalibrationWorks = await CalibrationWorkAssignUserModel.aggregate([...searchAggregaates, ...pagzingAggregaates]);
    const countAggregaates = [
        {
            $count: 'totalResults',
        },
    ];
    const totalResults = await CalibrationWorkAssignUserModel.aggregate([...searchAggregaates, ...countAggregaates]);
    return {
        myCalibrationWorks,
        totalResults: totalResults[0],
    };
};
const comfirmAcceptCalibrationWork = async (calibrationWork, user) => {
    const calibrationWorkAssignUser = await CalibrationWorkAssignUserModel.findOne({ calibrationWork, user });
    if (!calibrationWorkAssignUser) {
        throw new Error('calibrationWorkAssignUser not found');
    }
    if (calibrationWorkAssignUser.status !== calibrationWorkAssignUserStatus.assigned) {
        throw new Error('calibrationWorkAssignUser không thuộc trạng thái chấp nhận');
    }
    calibrationWorkAssignUser.status = calibrationWorkAssignUserStatus.accepted;
    calibrationWorkAssignUser.confirmDate = Date.now();
    calibrationWorkAssignUser.save();
    return calibrationWorkAssignUser;
};
const comfirmRejectCalibrationWork = async (calibrationWork, user, reasonsForRefusal) => {
    const calibrationWorkAssignUser = await CalibrationWorkAssignUserModel.findOne({ calibrationWork, user });
    if (!calibrationWorkAssignUser) {
        throw new Error('calibrationWorkAssignUser not found');
    }
    if (calibrationWorkAssignUser.status !== calibrationWorkAssignUserStatus.assigned) {
        throw new Error('calibrationWorkAssignUser không thuộc trạng thái từ chối');
    }
    // chuyển về trạng thái chờ phân công lại
    calibrationWorkAssignUser.status = calibrationWorkAssignUserStatus.reassignment;
    calibrationWorkAssignUser.refusalDate = Date.now();
    calibrationWorkAssignUser.reasonsForRefusal = reasonsForRefusal;
    calibrationWorkAssignUser.save();
    return calibrationWorkAssignUser;
};
const getCalibrationWorkAssignUserById = async (id) => {
    const calibrationWorkAssignUser = await CalibrationWorkAssignUserModel.findById(id).populate([
        {
            path: 'calibrationWork',
            populate: [
                {
                    path: 'assetMaintenance',
                    populate: [
                        { path: 'customer' },
                        {
                            path: 'assetModel',
                            populate: [
                                {
                                    path: 'asset',
                                },
                                {
                                    path: 'assetTypeCategory',
                                },
                                {
                                    path: 'category',
                                },
                                {
                                    path: 'manufacturer',
                                },
                                {
                                    path: 'subCategory',
                                },
                                {
                                    path: 'supplier',
                                },
                                {
                                    path: 'supplier',
                                },
                            ],
                        },
                    ],
                },
                { path: 'calibrationContract' },
            ],
        },
    ]);
    if (!calibrationWorkAssignUser) {
        throw new Error('calibrationWorkAssignUser not found');
    }
    return calibrationWorkAssignUser;
};
const calibratedComfirm = async (data) => {
    const {
        calibrationWorkAssignUser,
        checkInOutList,
        comment,
        downtimeHr,
        downtimeMin,
        isProblem,
        problemComment,
        newSupportDocuments,
        user,
        signature,
    } = data;
    const calibrationWorkAssignUserById = await CalibrationWorkAssignUserModel.findById(calibrationWorkAssignUser);
    if (!calibrationWorkAssignUserById) {
        throw new Error('calibrationWorkAssignUser not found');
    }
    // đóng check out lần check in cuối cùng nếu chưa check out
    const calibrationWorkCheckinCheckOutLast = await CalibrationWorkCheckinCheckOutModel.findOne({
        calibrationWorkAssignUser,
        user,
        checkOutDateTime: null,
    });
    if (calibrationWorkCheckinCheckOutLast) {
        calibrationWorkCheckinCheckOutLast.checkOutDateTime = new Date();
        await calibrationWorkCheckinCheckOutLast.save();
    }
    const calibrationWorkHistory = await CalibrationWorkHistoryModel.create({
        calibrationWorkAssignUser,
        calibrationWork: calibrationWorkAssignUserById.calibrationWork,
        isPassed: isProblem === true ? false : true,
        comment: problemComment ? problemComment : comment,
        downtimeHr,
        downtimeMin,
        cretaedBy: user,
        signature: signature,
    });
    if (checkInOutList && checkInOutList.length > 0) {
        for (const checkInOut of checkInOutList) {
            await CalibrationWorkCheckinCheckOutModel.create({
                calibrationWorkAssignUser,
                checkInDateTime: checkInOut.checkInDateTime,
                checkOutDateTime: checkInOut.checkOutDateTime,
                comment: comment,
                user,
                calibrationWork: calibrationWorkAssignUserById.calibrationWork,
                calibrationWorkHistory: calibrationWorkHistory?._id,
            });
        }
    }
    if (newSupportDocuments && newSupportDocuments.length > 0) {
        for (const doc of newSupportDocuments) {
            calibrationWorkAssignUser;
            await CalibrationAttachmentModel.create({
                calibrationWorkAssignUser,
                calibrationWork: calibrationWorkAssignUserById.calibrationWork,
                resource: doc.resource,
                calibrationWorkHistory: calibrationWorkHistory?._id,
            });
        }
    }
    const calibrationWork = await CalibrationWorkModel.findById(calibrationWorkAssignUserById.calibrationWork);
    if (isProblem === true) {
        // tạo bản ghi sự cố
        const payload = {
            createdBy: user,
            assetMaintenance: calibrationWork.assetMaintenance,
            code: await sequenceService.generateSequenceCode('BREAKDOWN_TIKET'),
            defectDescription: problemComment,
            calibrationWork: calibrationWork._id,
            calibrationWorkAssignUser,
        };
        const breakdownService = require('../common/breakdown.service');
        const breakdown = await breakdownService.createBreakdown(payload);
        const assetMaintenanceIsNotActiveHistory =
            await assetMaintenanceIsNotActiveHistoryService.assetMaintenanceIsNotActiveHistoryByAssetMaintenance(
                calibrationWork.assetMaintenance
            );
        if (assetMaintenanceIsNotActiveHistory.length == 0) {
            await assetMaintenanceIsNotActiveHistoryService.createAssetMaintenanceIsNotActiveHistory({
                assetMaintenance: calibrationWork.assetMaintenance,
                startDate: Date.now(),
                createdBy: user,
                origin: breakdown._id,
            });
        }
        // chuyển trạng thái kỹ sư thành hoàn thành 1 phần/ đợi hoàn thành breakdown
        calibrationWorkAssignUserById.status = calibrationWorkAssignUserStatus.partiallyCompleted;
        // chuyển trạng thái công việc thành inProgress
        calibrationWork.status = calibrationWorkStatus.inProgress;
        calibrationWork.isPassed = false;
        //lưu vết breakdown vào history
        calibrationWorkHistory.breakdown = breakdown._id;
        await calibrationWorkHistory.save();
    } else {
        calibrationWorkAssignUserById.status = calibrationWorkAssignUserStatus.completed;
        // đợi xét duyệt từ quản lý
        calibrationWork.status = calibrationWorkStatus.waitingForAdminApproval;
        calibrationWork.isPassed = true;
        calibrationWork.downtimeHr = downtimeHr;
        calibrationWork.downtimeMin = downtimeMin;

        // lưu lịch sử ngừng máy
        const payload = {
            assetMaintenance: calibrationWork.assetMaintenance,
            origin: calibrationWork._id,
            createdBy: user,
            startDate: calibrationWork.startDate,
            endDate: new Date(),
            time: (downtimeHr * 60 + downtimeMin) * 60 * 1000,
        };
        await AssetMaintenanceIsNotActiveHistoryModel.create(payload);

        // lưu vào bảng duyệt nhanh
        // const u = await User.findById(user);
        // const assetMaintenance = await AssetMaintenance.findById(calibrationWork.assetMaintenance)
        await ApprovalTaskModel.create({
            sourceType: approvedTaskType.close_calibration,
            sourceId: calibrationWork.id || calibrationWork._id,
            title: "Duyệt phiếu hiệu chuẩn",
            description: `Mã phiếu ${calibrationWork.code}`,
            data: {
                ...calibrationWork,

            },
            requestUser: user,
        })
    }

    // đều chuyển thành inprogess
    calibrationWork.groupStatus = calibrationWorkGroupStatus.inProgress;
    calibrationWork.signature = signature;
    calibrationWork.save();
    calibrationWorkAssignUserById.save();
    return calibrationWorkAssignUserById;
};
const comfirmCloseCalibrationWork = async (data) => {
    const { calibrationWork, note } = data;
    const calibrationWorkById = await getCalibrationWorkByIdNotPopulate(calibrationWork);
    calibrationWorkById.groupStatus = calibrationWorkGroupStatus.history;
    calibrationWorkById.status = calibrationWorkStatus.completed;
    calibrationWorkById.note = note;
    calibrationWorkById.save();
    await CalibrationWorkAssignUserModel.updateMany(
        {
            calibrationWork: calibrationWorkById?._id,
            status: {
                $in: [
                    calibrationWorkAssignUserStatus.accepted,
                    calibrationWorkAssignUserStatus.assigned,
                    calibrationWorkAssignUserStatus.inProgress,
                    calibrationWorkAssignUserStatus.reassignment,
                    calibrationWorkAssignUserStatus.partiallyCompleted,
                    calibrationWorkAssignUserStatus.completeRecalibrationIssue,
                ],
            },
        },
        { status: calibrationWorkAssignUserStatus.completed, completionDate: Date.now() }
    );

    return calibrationWorkById;
};
const comfirmReOpenCalibrationWork = async (data) => {
    const { calibrationWork, reasonForReopening } = data;
    const calibrationWorkById = await getCalibrationWorkByIdNotPopulate(calibrationWork);
    calibrationWorkById.groupStatus = calibrationWorkGroupStatus.inProgress;
    calibrationWorkById.status = calibrationWorkStatus.reOpen;
    calibrationWorkById.save();
    await CalibrationWorkAssignUserModel.updateMany(
        {
            calibrationWork: calibrationWorkById?._id,
            status: {
                $in: [
                    calibrationWorkAssignUserStatus.accepted,
                    calibrationWorkAssignUserStatus.assigned,
                    calibrationWorkAssignUserStatus.inProgress,
                    calibrationWorkAssignUserStatus.reassignment,
                    calibrationWorkAssignUserStatus.completed,
                    calibrationWorkAssignUserStatus.partiallyCompleted,
                    calibrationWorkAssignUserStatus.completeRecalibrationIssue,
                ],
            },
        },
        { status: calibrationWorkAssignUserStatus.reassignment, reasonForReopening }
    );
    return calibrationWorkById;
};
const getAllCalibrationWorkHistorys = async (data) => {
    const calibrationWorkHistorys = await CalibrationWorkHistoryModel.find(data)
        .populate([
            { path: 'createdBy' },
            { path: 'breakdown' },
            { path: 'calibrationWorkAssignUser', populate: { path: 'user' } },
            {
                path: 'calibrationWork',
                populate: [{ path: 'calibration' }, { path: 'assetMaintenance' }],
            },
        ])
        .sort({ createdAt: -1 });

    return calibrationWorkHistorys;
};
const getCurrentCalibrationWorkCheckinCheckout = async (userId) => {
    const currentCheckinCheckout = await CalibrationWorkCheckinCheckOutModel.findOne({
        user: userId,
        checkOutDateTime: null,
    }).populate([
        {
            path: 'calibrationWork',
        },
    ]);
    return currentCheckinCheckout;
};
const checkinCalibrationWork = async (calibrationWork, userId) => {
    // chuyển trạng thái sang đang tiến hành
    const calibrationAssignUser = await CalibrationWorkAssignUserModel.findOneAndUpdate(
        { calibrationWork: calibrationWork, user: userId },
        {
            $set: { status: calibrationWorkAssignUserStatus.inProgress },
        }
    );
    const calibrationWorkCheckinCheckout = await CalibrationWorkCheckinCheckOutModel.create({
        user: userId,
        calibrationWork: calibrationWork,
        calibrationWorkAssignUser: calibrationAssignUser?._id,
        checkInDateTime: Date.now(),
    });
    await CalibrationWorkModel.findByIdAndUpdate(calibrationAssignUser.calibrationWork, {
        status: calibrationWorkStatus.inProgress,
        groupStatus: calibrationWorkGroupStatus.inProgress,
    });
    return calibrationWorkCheckinCheckout;
};
const checkOutcalibrationWork = async (calibrationWorkCheckinCheckOutId, comment, userId) => {
    const calibrationWorkCheckinCheckout = await CalibrationWorkCheckinCheckOutModel.findById(
        calibrationWorkCheckinCheckOutId
    );
    if (!calibrationWorkCheckinCheckout || calibrationWorkCheckinCheckout.checkOutDateTime) {
        throw new ApiError(httpStatus.NOT_FOUND, 'calibrationWorkCheckinCheckout not found');
    }
    await CalibrationWorkCheckinCheckOutModel.findByIdAndUpdate(calibrationWorkCheckinCheckOutId, {
        comment: comment,
        checkOutDateTime: new Date(),
    });
    return calibrationWorkCheckinCheckout;
};
const getLastCalibrationWorkCheckinCheckOut = async (data) => {
    const lastCalibrationWorkCheckinCheckOut = await CalibrationWorkCheckinCheckOutModel.findOne(data).sort({
        checkInDateTime: -1,
    });
    return lastCalibrationWorkCheckinCheckOut;
};
const createCalibrationWorkComment = async (data) => {
    const create = await CalibrationWorkCommentModel.create(data);
    return create;
};
const getCalibrationWorkComments = async (filter, options = {}) => {
    const calibrationWorkFilter = { ...filter };
    // Chuyển đổi calibrationWork sang ObjectId nếu có
    if (filter.calibrationWork && mongoose.Types.ObjectId.isValid(filter.calibrationWork)) {
        calibrationWorkFilter.calibrationWork = new mongoose.Types.ObjectId(filter.calibrationWork);
    }
    const comments = await CalibrationWorkCommentModel.paginate(calibrationWorkFilter, {
        ...options,
        populate: [
            {
                path: 'createdBy',
            },
        ],
    });
    return comments;
};
const queryGroupCalibrationWorks = async (filter, options, user) => {
    const myCalibrationWorkFilter = filter;
    const calibrationWorkMatch = {};
    const userIds = await schedulePreventiveService.getUserIdsByDepartment(user);
    const calibrationWorkAssignUserActiveNow = await CalibrationWorkAssignUserModel.find({
        user: { $in: userIds },
        status: { $nin: [calibrationWorkAssignUserStatus.replacement] },
    }).distinct('_id');
    if (userIds && userIds.length > 0) {
        myCalibrationWorkFilter._id = { $in: calibrationWorkAssignUserActiveNow };
    }
    if (filter.searchText) {
        const regex = { $regex: filter.searchText, $options: 'i' };
        calibrationWorkMatch.$or = [
            { 'calibrationWork.calibrationName': regex },
            { 'calibrationWork.code': regex },
            { 'calibrationWork.assetMaintenance.serial': regex },
            { 'calibrationWork.assetMaintenance.assetModel.asset.assetName': regex },
            { 'calibrationWork.assetMaintenance.assetModel.assetModelName': regex },
        ];
        delete myCalibrationWorkFilter.searchText;
    }
    if (filter.calibrationName) {
        calibrationWorkMatch['calibrationWork.calibrationName'] = {
            $regex: filter.calibrationName,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.calibrationName;
    }
    if (filter.startDate || filter.endDate) {
        const range = {};
        if (filter.startDate) range.$gte = new Date(filter.startDate);
        if (filter.endDate) range.$lte = new Date(filter.endDate);
        calibrationWorkMatch['startDate'] = range;
        delete filter.startDate;
        delete filter.endDate;
    }
    if (filter.calibrationWorkAssignUserStatuses) {
        myCalibrationWorkFilter.status = { $in: filter.calibrationWorkAssignUserStatuses };
    }
    if (filter.calibrationWorkAssignUserStatus) {
        myCalibrationWorkFilter.status = filter.calibrationWorkAssignUserStatus;
        delete filter.calibrationWorkAssignUserStatus;
    }
    if (filter.code) {
        calibrationWorkMatch['calibrationWork.code'] = {
            $regex: filter.code,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.code;
    }
    if (filter.importance) {
        calibrationWorkMatch['calibrationWork.importance'] = filter.importance;
        delete filter.importance;
    }
    if (filter.serial) {
        calibrationWorkMatch['calibrationWork.assetMaintenance.serial'] = {
            $regex: filter.serial,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.serial;
    }
    if (filter.assetName) {
        calibrationWorkMatch['calibrationWork.assetMaintenance.assetModel.asset.assetName'] = {
            $regex: filter.assetName,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.assetName;
    }
    if (filter.assetModelName) {
        calibrationWorkMatch['calibrationWork.assetMaintenance.assetModel.assetModelName'] = {
            $regex: filter.assetModelName,
            $options: 'i', // không phân biệt hoa thường
        };
        delete filter.assetModelName;
    }
    if (filter.branchs) {
        const _branchs = filter.branchs.map((_b) => mongoose.Types.ObjectId(_b));
        calibrationWorkMatch['calibrationWork.assetMaintenance.branch'] = {
            $in: _branchs,
        };
    }
    delete filter.branchs;
    const now = new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    switch (filter.calibrationWorkAssignUserGroupStatus) {
        case calibrationWorkGroupStatus.upcoming:
            calibrationWorkMatch['calibrationWork.startDate'] = {
                $gt: endOfToday,
            };
            break;
        case calibrationWorkGroupStatus.new:
            const twoDaysLater = new Date();
            twoDaysLater.setDate(twoDaysLater.getDate() + 2); // đang cộng thêm 2 ngày
            calibrationWorkMatch['calibrationWork.startDate'] = {
                $lte: twoDaysLater,
            };
            break;
        case calibrationWorkGroupStatus.overdue:
            calibrationWorkMatch['calibrationWork.startDate'] = {
                $lte: endOfToday,
            };
            break;
        default:
            break;
    }

    delete filter.calibrationWorkAssignUserStatuses;
    delete filter.calibrationWorkAssignUserGroupStatus;
    const searchAggregaates = [
        {
            $match: myCalibrationWorkFilter,
        },
        {
            $lookup: {
                from: 'assetmaintenances',
                localField: 'calibrationWork.assetMaintenance',
                foreignField: '_id',
                as: 'assetMaintenance',
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $lookup: {
                from: 'calibrationworks',
                localField: 'calibrationWork',
                foreignField: '_id',
                as: 'calibrationWork',
                pipeline: [
                    {
                        $lookup: {
                            from: 'assetmaintenances',
                            localField: 'assetMaintenance',
                            foreignField: '_id',
                            as: 'assetMaintenance',
                            pipeline: [
                                {
                                    $lookup: {
                                        from: 'assetmodels',
                                        localField: 'assetModel',
                                        foreignField: '_id',
                                        as: 'assetModel',
                                        pipeline: [
                                            {
                                                $lookup: {
                                                    from: 'assets',
                                                    localField: 'asset',
                                                    foreignField: '_id',
                                                    as: 'asset',
                                                },
                                            },
                                            { $unwind: { path: '$asset', preserveNullAndEmptyArrays: true } },
                                        ],
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'customers',
                                        localField: 'customer',
                                        foreignField: '_id',
                                        as: 'customer',
                                    },
                                },
                                { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
                                { $unwind: { path: '$assetModel', preserveNullAndEmptyArrays: true } },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'calibrations',
                            localField: 'calibration',
                            foreignField: '_id',
                            as: 'calibration',
                        },
                    },
                    {
                        $lookup: {
                            from: 'calibrationcontracts',
                            localField: 'calibrationContract',
                            foreignField: '_id',
                            as: 'calibrationContract',
                        },
                    },
                    { $unwind: { path: '$calibrationContract', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$calibration', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$assetMaintenance', preserveNullAndEmptyArrays: true } },
                ],
            },
        },
        { $unwind: { path: '$assetMaintenance', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$calibrationWork', preserveNullAndEmptyArrays: false } },
        {
            $addFields: {
                startDate: '$calibrationWork.startDate',
            },
        },
        { $match: calibrationWorkMatch },
    ];
    if (options.sortBy && options.sortOrder) {
        searchAggregaates.push({
            $sort: { [options.sortBy]: options.sortOrder },
        });
    }
    const pagzingAggregaates = [
        {
            $skip: (options.page - 1) * options.limit,
        },
        {
            $limit: options.limit,
        },
    ];
    const myCalibrationWorks = await CalibrationWorkAssignUserModel.aggregate([...searchAggregaates, ...pagzingAggregaates]);
    const countAggregaates = [
        {
            $count: 'totalResults',
        },
    ];
    const totalResults = await CalibrationWorkAssignUserModel.aggregate([...searchAggregaates, ...countAggregaates]);
    return {
        myCalibrationWorks,
        totalResults: totalResults[0],
    };
};
const getTotalCalibrationWorkByGroupStatus = async () => {
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const totalCalibrationWorkByNews = await CalibrationWorkModel.countDocuments({
        groupStatus: calibrationWorkGroupStatus.new,
        startDate: { $lte: twoDaysLater },
    });
    const totalCalibrationWorkByinProgress = await CalibrationWorkModel.countDocuments({
        groupStatus: calibrationWorkGroupStatus.inProgress,
        startDate: { $lte: twoDaysLater },
    });
    const totalCalibrationWorkByOverdues = await CalibrationWorkModel.countDocuments({
        groupStatus: { $in: [calibrationWorkGroupStatus.new, calibrationWorkGroupStatus.inProgress] },
        startDate: { $lte: endOfToday },
    });
    const totalCalibrationWorkByUpcomings = await CalibrationWorkModel.countDocuments({
        groupStatus: calibrationWorkGroupStatus.new,
        startDate: { $gt: endOfToday },
    });
    return {
        totalCalibrationWorkByNews,
        totalCalibrationWorkByinProgress,
        totalCalibrationWorkByOverdues,
        totalCalibrationWorkByUpcomings,
    };
};
const getTotalCalibrationWorkAssignUserByStatus = async (_user) => {
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const userId = new mongoose.Types.ObjectId(_user);
    const baseLookupAndUnwind = [
        {
            $lookup: {
                from: 'calibrationworks',
                localField: 'calibrationWork',
                foreignField: '_id',
                as: 'calibrationWork',
                pipeline: [{ $project: { startDate: 1, groupStatus: 1 } }],
            },
        },
        { $unwind: { path: '$calibrationWork', preserveNullAndEmptyArrays: true } },
    ];
    const aggNew = await CalibrationWorkAssignUserModel.aggregate([
        ...baseLookupAndUnwind,
        {
            $match: {
                status: { $in: [calibrationWorkAssignUserStatus.accepted, calibrationWorkAssignUserStatus.assigned] },
                'calibrationWork.startDate': { $lte: twoDaysLater },
                user: userId,
            },
        },
        { $count: 'count' },
    ]);
    const aggInProgress = await CalibrationWorkAssignUserModel.aggregate([
        ...baseLookupAndUnwind,
        {
            $match: {
                status: {
                    $in: [
                        calibrationWorkAssignUserStatus.inProgress,
                        calibrationWorkAssignUserStatus.partiallyCompleted,
                        calibrationWorkAssignUserStatus.completeRecalibrationIssue,
                    ],
                },
                'calibrationWork.startDate': { $lte: twoDaysLater },
                user: userId,
            },
        },
        { $count: 'count' },
    ]);
    const aggOverdue = await CalibrationWorkAssignUserModel.aggregate([
        ...baseLookupAndUnwind,
        {
            $match: {
                status: {
                    $in: [
                        calibrationWorkAssignUserStatus.accepted,
                        calibrationWorkAssignUserStatus.assigned,
                        calibrationWorkAssignUserStatus.inProgress,
                        calibrationWorkAssignUserStatus.partiallyCompleted,
                        calibrationWorkAssignUserStatus.completeRecalibrationIssue,
                    ],
                },
                'calibrationWork.startDate': { $lte: endOfToday },
                user: userId,
            },
        },
        { $count: 'count' },
    ]);
    return {
        totalCalibrationWorkAssignUserByNews: (aggNew[0] && aggNew[0].count) || 0,
        totalCalibrationWorkAssignUserByinProgress: (aggInProgress[0] && aggInProgress[0].count) || 0,
        totalCalibrationWorkAssignUserByOverdues: (aggOverdue[0] && aggOverdue[0].count) || 0,
    };
};
const getAssetCalibrationWorkHistorys = async (filter, options) => {
    const payloadFilter = {};
    if (filter.assetMaintenance) {
        payloadFilter.assetMaintenance = mongoose.Types.ObjectId(filter.assetMaintenance);
    }
    if (filter.code) {
        payloadFilter.code = filter.code;
    }
    if (filter.calibrationName) {
        payloadFilter.calibrationName = filter.calibrationName;
    }
    if (filter.importance) {
        payloadFilter.importance = filter.importance;
    }
    if (filter.assetStyle) {
        payloadFilter.assetStyle = filter.assetStyle;
    }
    if (filter.statuses) {
        payloadFilter.status = { $in: filter.statuses };
    }
    const dateFilter = {};
    if (filter.startDate) {
        dateFilter.$gte = new Date(filter.startDate);
    }
    if (filter.endDate) {
        const end = new Date(filter.endDate);
        end.setHours(23, 59, 59, 999); // tính tới cuối ngày
        dateFilter.$lte = end;
    }
    if (Object.keys(dateFilter).length) {
        payloadFilter.startDate = { ...dateFilter };
    }
    const calibrationWorks = await CalibrationWorkModel.paginate(payloadFilter, {
        ...options,
        populate: [
            {
                path: 'assetMaintenance',
            },
        ],
    });
    return calibrationWorks;
};
const getCalibrationWorkAssignUserByUser = async (userId) => {
    const total = await CalibrationWorkAssignUserModel.countDocuments({
        user: userId,
        status: {
            $in: [
                calibrationWorkAssignUserStatus.assigned,
                calibrationWorkAssignUserStatus.accepted,
                calibrationWorkAssignUserStatus.inProgress,
                calibrationWorkAssignUserStatus.partiallyCompleted,
                calibrationWorkAssignUserStatus.completeRecalibrationIssue,
            ],
        },
    });
    return total;
};

const getCalibrationWorkHistory = async (id) => {
    console.log(id);
    const checkInCheckOut = await CalibrationWorkCheckinCheckOutModel.find({ calibrationWorkHistory: id });
    const attachment = await CalibrationAttachmentModel.find({ calibrationWorkHistory: id }).populate({ path: 'resource' });

    return { checkInCheckOut, attachment };
};
const updateCalibratedComfirm = async (data) => {
    const {
        calibrationWorkAssignUser,
        checkInOutList,
        comment,
        downtimeHr,
        downtimeMin,
        isProblem,
        problemComment,
        newSupportDocuments,
        user,
        signature,
    } = data;
    const calibrationWorkAssignUserById = await CalibrationWorkAssignUserModel.findById(calibrationWorkAssignUser);
    if (!calibrationWorkAssignUserById) {
        throw new Error('calibrationWorkAssignUser not found');
    }
    // đóng check out lần check in cuối cùng nếu chưa check out
    const calibrationWorkCheckinCheckOutLast = await CalibrationWorkCheckinCheckOutModel.findOne({
        calibrationWorkAssignUser,
        user,
        checkOutDateTime: null,
    });
    if (calibrationWorkCheckinCheckOutLast) {
        calibrationWorkCheckinCheckOutLast.checkOutDateTime = new Date();
        await calibrationWorkCheckinCheckOutLast.save();
    }
    await CalibrationWorkCheckinCheckOutModel.deleteMany({ calibrationWorkAssignUser });
    await CalibrationAttachmentModel.deleteMany({ calibrationWorkAssignUser });
    if (checkInOutList && checkInOutList.length > 0) {
        for (const checkInOut of checkInOutList) {
            await CalibrationWorkCheckinCheckOutModel.create({
                calibrationWorkAssignUser,
                checkInDateTime: checkInOut.checkInDateTime,
                checkOutDateTime: checkInOut.checkOutDateTime,
                comment: comment,
                user,
                calibrationWork: calibrationWorkAssignUserById.calibrationWork,
            });
        }
    }
    if (newSupportDocuments && newSupportDocuments.length > 0) {
        for (const doc of newSupportDocuments) {
            calibrationWorkAssignUser;
            await CalibrationAttachmentModel.create({
                calibrationWorkAssignUser,
                calibrationWork: calibrationWorkAssignUserById.calibrationWork,
                resource: doc.resource,
            });
        }
    }
    const calibrationWork = await CalibrationWorkModel.findById(calibrationWorkAssignUserById.calibrationWork);
    calibrationWork.downtimeHr = downtimeHr;
    calibrationWork.downtimeMin = downtimeMin;
    calibrationWork.groupStatus = calibrationWorkGroupStatus.inProgress;
    calibrationWork.signature = signature;
    calibrationWork.save();
    calibrationWorkAssignUserById.save();
    return calibrationWorkAssignUserById;
};
const getDataByCalibrationWorkAssignUser = async (calibrationWorkAssignUserId) => {
    const listDocuments = await CalibrationAttachmentModel.find({
        calibrationWorkAssignUser: calibrationWorkAssignUserId,
        calibrationWorkHistory: null,
    })
        .populate({ path: 'resource' })
        .sort({ createdAt: 1 });
    const checkInOutList = await CalibrationWorkCheckinCheckOutModel.find({
        calibrationWorkAssignUser: calibrationWorkAssignUserId,
        calibrationWorkHistory: null,
    }).sort({ createdAt: 1 });
    return { listDocuments, checkInOutList };
};
const getDownTimeByCalibrationWorkAssignUser = async (calibrationWorkAssignUser) => {
    const data = await CalibrationWorkCheckinCheckOutModel.findOne({
        calibrationWorkAssignUser: calibrationWorkAssignUser,
        calibrationWorkHistory: null,
    }).sort({ createdAt: 1 });
    let totalMinutes = 0;
    if (data && data.checkInDateTime) {
        const diffMs = new Date() - data.checkInDateTime;
        const minutes = Math.floor(diffMs / (1000 * 60));
        totalMinutes += minutes;
    }
    const downtimeHr = Math.floor(totalMinutes / 60);
    const downtimeMin = totalMinutes % 60;
    return { downtimeHr, downtimeMin };
};
module.exports = {
    getAllCalibrationWorkHistorys,
    createCalibrationWork,
    queryCalibrationWorks,
    getCalibrationWorkAssignUserByRes,
    comfirmCancelCalibrationWorkById,
    deleteCalibrationWorkById,
    createCalibrationWorkAssignUser,
    reassignmentCalibrationWorkAssignUser,
    getCalibrationWorkById,
    queryMyCalibrationWorks,
    comfirmAcceptCalibrationWork,
    comfirmRejectCalibrationWork,
    getCalibrationWorkAssignUserById,
    calibratedComfirm,
    comfirmCloseCalibrationWork,
    comfirmReOpenCalibrationWork,
    getCurrentCalibrationWorkCheckinCheckout,
    checkinCalibrationWork,
    checkOutcalibrationWork,
    getLastCalibrationWorkCheckinCheckOut,
    createCalibrationWorkComment,
    getCalibrationWorkComments,
    queryGroupCalibrationWorks,
    getTotalCalibrationWorkByGroupStatus,
    getTotalCalibrationWorkAssignUserByStatus,
    getAssetCalibrationWorkHistorys,
    getCalibrationWorkAssignUserByUser,
    getCalibrationWorkHistory,
    updateCalibratedComfirm,
    getDataByCalibrationWorkAssignUser,
    getDownTimeByCalibrationWorkAssignUser,
};
