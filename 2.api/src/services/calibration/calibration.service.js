const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const {
    CalibrationModel,
    CalibrationAssignUserModel,
    CalibrationWorkModel,
    CalibrationWorkAssignUserModel,
    AssetMaintenance,
    CalibrationContractMappingAssetMaintenanceModel,
} = require('../../models');
const { calibrationWorkStatus, dateType, calibrationStatus, calibrationWorkGroupStatus } = require('../../utils/constant');
const { sequenceService } = require('..');

const createCalibration = async (data) => {
    const calibration = await CalibrationModel.create(data);
    return calibration;
};
const queryCalibrations = async (filter, options) => {
    const calibrationFilter = filter;
    const calibrationMatch = {};

    // searchText
    if (filter.searchText) {
        const text = filter.searchText;
        calibrationMatch.$or = [
            { code: { $regex: text, $options: 'i' } },
            { calibrationName: { $regex: text, $options: 'i' } },
            { 'assetMaintenance.serial': { $regex: text, $options: 'i' } },
            { 'assetMaintenance.assetModel.assetModelName': { $regex: text, $options: 'i' } },
            { 'assetMaintenance.assetModel.asset.assetName': { $regex: text, $options: 'i' } },
        ];

        delete filter.searchText;
    }
    if (filter.code) {
        calibrationFilter.code = { $regex: filter.code, $options: 'i' };
    }
    if (filter.calibrationName) {
        calibrationFilter.calibrationName = { $regex: filter.calibrationName, $options: 'i' };
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
    const calibrations = await CalibrationModel.aggregate([...searchAggregaates, ...pagzingAggregaates]);
    const countAggregaates = [
        {
            $count: 'totalResults',
        },
    ];
    const totalResults = await CalibrationModel.aggregate([...searchAggregaates, ...countAggregaates]);
    return {
        calibrations,
        totalResults: totalResults[0],
    };
};
const getCalibrationByIdNotPopulate = async (id) => {
    const catlibration = await CalibrationModel.findById(id);
    if (!catlibration) {
        throw new Error('catlibration not found');
    }
    return catlibration;
};
const deleteCalibrationById = async (id) => {
    const calibration = await getCalibrationByIdNotPopulate(id);
    const checkCalibrationWorks = await CalibrationWorkModel.find({
        calibration: id,
        status: { $nin: [calibrationWorkStatus.new] },
    });
    if (checkCalibrationWorks && checkCalibrationWorks.length > 0) {
        throw new Error('CalibrationWork đang được sử dụng');
    }
    if (checkCalibrationWorks)
        // xóa assignUser
        await CalibrationAssignUserModel.deleteMany({ calibration: id });
    const calibrationWorks = await CalibrationWorkModel.find({
        calibration: id,
    });
    if (calibrationWorks && calibrationWorks.length > 0) {
        const calibrationWorkIds = calibrationWorks.map((w) => w._id);
        // Xóa tất cả các CalibrationWorkAssignUser liên quan
        await CalibrationWorkAssignUserModel.deleteMany({
            calibrationWork: { $in: calibrationWorkIds },
        });
        // Xóa luôn các CalibrationWork tương ứng
        await CalibrationWorkModel.deleteMany({
            _id: { $in: calibrationWorkIds },
        });
    }

    await calibration.remove();
    return calibration;
};
const createCalibrationAssignUser = async (data) => {
    if (!data.calibration) {
        throw new ApiError(httpStatus.NOT_FOUND, 'calibration not found');
    }
    const count = await CalibrationAssignUserModel.countDocuments({
        calibration: data.calibration,
    });
    if (count >= 2) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Calibration chỉ được phép gán tối đa 2 người dùng');
    }
    const calibrationAssignUser = await CalibrationAssignUserModel.create(data);
    return calibrationAssignUser;
};
const reassignmentUser = async (user, calibration, oldUser) => {
    if (mongoose.Types.ObjectId(user) === mongoose.Types.ObjectId(oldUser)) {
        return;
    }
    await CalibrationAssignUserModel.findOneAndDelete({ user: oldUser, calibration });
    const calibrationAssignUser = await CalibrationAssignUserModel.create({ user, calibration });
    return calibrationAssignUser;
};
const getCalibrationAssignUserByRes = async (res) => {
    const calibrationAssignUsers = await CalibrationAssignUserModel.find(res).populate([
        { path: 'user', populate: [{ path: 'role' }, { path: 'branch' }] },
        { path: 'calibration' },
    ]);
    return calibrationAssignUsers;
};
const updateCalibrationById = async (id, data) => {
    const calibration = await getCalibrationByIdNotPopulate(id);
    Object.assign(calibration, data);
    await calibration.save();
    return calibration;
};
const getCalibrationById = async (id) => {
    const catlibration = await CalibrationModel.findById(id).populate([
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
                { path: 'customer', select: 'customerName' },
            ],
        },
        {
            path: 'customer',
        },
    ]);
    if (!catlibration) {
        throw new Error('catlibration not found');
    }
    return catlibration;
};

const generateCalibration = async (calibrationId, _startDate) => {
    const startDate = new Date(_startDate);
    const calibration = await CalibrationModel.findById(calibrationId).lean();
    if (!calibration) {
        throw new Error('calibration not found');
    }
    const assetMaintenance = await AssetMaintenance.findById(calibration.assetMaintenance);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // Gen trước khoảng 1 năm

    let currentDate = new Date(startDate);
    const createdWorks = [];

    while (currentDate <= endDate) {
        const payload = {
            ...calibration,
            code: await sequenceService.generateSequenceCode('CALIBRATION_WORK'),
            _id: undefined,
            calibration: calibration._id,
            status: undefined,
            startDate: new Date(currentDate),
            customer: assetMaintenance.customer,
            createdAt: undefined,
            updatedAt: undefined,
        };
        const createCalibrationWork = await CalibrationWorkModel.create(payload);
        const calibrationAssignUsers = await CalibrationAssignUserModel.find({ calibration: calibration._id }).lean();
        if (calibrationAssignUsers && calibrationAssignUsers.length > 0) {
            for (const user of calibrationAssignUsers) {
                await CalibrationWorkAssignUserModel.create({
                    ...user,
                    calibrationWork: createCalibrationWork?._id,
                    _id: undefined,
                    status: undefined,
                    createdAt: undefined,
                    updatedAt: undefined,
                });
            }
        }
        createdWorks.push(createCalibrationWork);

        // Tính next date dựa trên dateType và numberNext
        switch (calibration.dateType) {
            case dateType.days:
                currentDate.setDate(currentDate.getDate() + calibration.numberNext);
                break;
            case dateType.weeks:
                currentDate.setDate(currentDate.getDate() + calibration.numberNext * 7);
                break;
            case dateType.months:
                currentDate.setMonth(currentDate.getMonth() + calibration.numberNext);
                break;
            case dateType.years:
                currentDate.setFullYear(currentDate.getFullYear() + calibration.numberNext);
                break;
            default:
                // Nếu không match, dừng
                currentDate = new Date(endDate.getTime() + 1);
                break;
        }
    }
    return createdWorks;
};
const startCalibration = async (id, startDate) => {
    if (!startDate) {
        throw new Error('Chưa nhập ngày bắt đầu');
    }
    const calibration = await getCalibrationByIdNotPopulate(id);
    Object.assign(calibration, { isStart: true, startDate, status: calibrationStatus.started });
    await generateCalibration(calibration?._id, startDate);
    await calibration.save();
    return calibration;
};
const stopCalibration = async (id) => {
    const calibration = await getCalibrationByIdNotPopulate(id);
    Object.assign(calibration, { isStart: false, status: calibrationStatus.stoped });
    const calibrationWorks = await CalibrationWorkModel.find({
        calibration: id,
        status: calibrationWorkStatus.new,
        startDate: { $gt: new Date() }, // lớn hơn thời gian hiện tại
    });
    if (calibrationWorks && calibrationWorks.length > 0) {
        const calibrationWorkIds = calibrationWorks.map((w) => w._id);
        // Xóa tất cả các CalibrationWorkAssignUser liên quan
        await CalibrationWorkAssignUserModel.deleteMany({
            calibrationWork: { $in: calibrationWorkIds },
        });
        // Xóa luôn các CalibrationWork tương ứng
        await CalibrationWorkModel.deleteMany({
            _id: { $in: calibrationWorkIds },
        });
    }
    await calibration.save();
    return calibration;
};
const getCalibrationContractByCalibrations = async (calibrationIds) => {
    const calibration = await CalibrationModel.findById(calibrationIds);
    if (!calibration) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Calibration not found');
    }
    const calibrationContractMappingAssetMaintenances = await CalibrationContractMappingAssetMaintenanceModel.find({
        assetMaintenance: calibration.assetMaintenance,
    }).populate({
        path: 'calibrationContract',
    });
    const calibrationContracts = calibrationContractMappingAssetMaintenances.map((item) => item.calibrationContract);
    return calibrationContracts;
};
const updateCalibrationWorkByCalibrationContract = async (calibrationId, calibrationContractId) => {
    const calibrationWorks = await CalibrationWorkModel.find({
        calibration: calibrationId,
        groupStatus: { $in: [calibrationWorkGroupStatus.new, calibrationWorkGroupStatus.inProgress] },
    });
    if (calibrationWorks && calibrationWorks.length > 0) {
        for (const work of calibrationWorks) {
            await CalibrationWorkModel.findByIdAndUpdate(work._id, { calibrationContract: calibrationContractId });
        }
    }
};
module.exports = {
    createCalibration,
    queryCalibrations,
    getCalibrationByIdNotPopulate,
    deleteCalibrationById,
    createCalibrationAssignUser,
    reassignmentUser,
    getCalibrationAssignUserByRes,
    updateCalibrationById,
    getCalibrationById,
    generateCalibration,
    startCalibration,
    stopCalibration,
    getCalibrationContractByCalibrations,
    updateCalibrationWorkByCalibrationContract
};
