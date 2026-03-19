const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {
    AssetMaintenance,
    DepreciationBase,
    DepreciationType,
    AssetModel,
    Asset,
    AssetMaintenanceLocationHistoryModel,
    Breakdown,
    SchedulePreventiveModel,
    AssetMaintenanceIsNotActiveHistoryModel,
    AssetTypeCategoryModel,
    Category,
    Manufacturer,
    SubCategory,
    Customer
} = require('../../models');
const ApiError = require('../../utils/ApiError');
const breakdownService = require('./breakdown.service');
const schedulePreventiveService = require('../preventive/schedulePreventive.service');
const SchedulePreventive = require('../../models/preventive/schedulePreventive.model');
const { NotificationSettingModel } = require('../../models/notification');

// /**
//  *
//  * @returns
//  */
// const savecAsset = async (status) => {
//     const create = await Asset.create({
//         status,
//     });
//     return create;
// };

/**
 * Create a user
 * @param {Object} category
 * @returns {Promise<User>}
 */
const createAssetMaintenance = async (data) => {
    return AssetMaintenance.create(data);
};
const createAssetModel = async (data) => {
    return AssetModel.create(data);
};
const getAssetMaintenanceByData = async (data) => {
    return AssetMaintenance.find(data);
};
const getAssetMaintenanceByQrCode = async (data) => {
    return AssetMaintenance.find({ qrCode: data });
};
const getAssetModelByName = async (data) => {
    return AssetModel.find({ assetModelName: data });
};
/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAssetMaintenances = async (_filter, options) => {
    const filter = { ..._filter };
    if (filter.assetAges && Array.isArray(filter.assetAges)) {
        const now = new Date();
        const ageConditions = filter.assetAges.map((age) => {
            const parsedAge = parseInt(age);
            const startDate = new Date(now.getFullYear() - parsedAge - 1, now.getMonth(), now.getDate() + 1);
            const endDate = new Date(now.getFullYear() - parsedAge, now.getMonth(), now.getDate());
            return { purchaseDate: { $gte: startDate, $lte: endDate } };
        });
        filter.$or = ageConditions;
        delete filter.assetAges;
    }
    ['assetModel', 'customer', '_id'].forEach((key) => {
        if (filter[key] && typeof filter[key] === 'string' && mongoose.Types.ObjectId.isValid(filter[key])) {
            filter[key] = mongoose.Types.ObjectId(filter[key]);
        }
    });
    const assetFilter = {};
    ['manufacturer', 'category', 'subCategory', 'asset'].forEach((key) => {
        if (filter[key]) {
            assetFilter[key] = filter[key];
            delete filter[key];
        }
    });
    if (filter.assetStyle) {
        filter.assetStyle = Number(filter.assetStyle);
    }
    if (Object.keys(assetFilter).length > 0) {
        const assetModels = await AssetModel.find(assetFilter).select('_id');
        filter.assetModel = { $in: assetModels.map((a) => a._id) };
    }

    // tìm theo textindex
    // if (filter.searchText && typeof filter.searchText === 'string') {
    //     filter.$text = { $search: filter.searchText };
    //     delete filter.searchText;
    // }

    // tìm theo regex (không dùng textindex)
    if (filter.searchText && typeof filter.searchText === 'string') {
        const regex = new RegExp(filter.searchText, 'i');

        filter.$or = [
            { assetName: regex },
            { assetModelName: regex },
            { manufacturerName: regex },
            { categoryName: regex },
            { subCategoryName: regex },
            { serial: regex },
            { assetNumber: regex },
            { customerName: regex }
        ];

        delete filter.searchText;
    }

    // Các trường còn lại như serial, qrCode lọc trực tiếp
    const assetMaintenances = await AssetMaintenance.paginate(filter, {
        ...options,
        populate: [
            {
                path: 'assetModel',
                populate: [
                    { path: 'manufacturer' },
                    { path: 'subCategory' },
                    { path: 'category' },
                    { path: 'assetTypeCategory' },
                    { path: 'asset' },
                ],
            },
            { path: 'resource' },
            { path: 'customer' },
        ],
    });
    // assetMaintenances.docs = await Promise.all(
    //     assetMaintenances.docs.map(async (doc) => {
    //         const totalEquipmentDowntime = await breakdownService.totalEquipmentDowntime(doc._id); // gọi đúng hàm
    //         const obj = doc.toObject(); // nếu là mongoose document
    //         return { ...obj, totalEquipmentDowntime };
    //     })
    // );
    return assetMaintenances;
};
/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getAssetMaintenanceById = async (id) => {
    return AssetMaintenance.findById(id).populate([
        {
            path: 'assetModel',
            populate: [
                {
                    path: 'asset',
                },
                { path: 'manufacturer' },
                { path: 'subCategory' },
                { path: 'category' },
                { path: 'assetTypeCategory' },
                { path: 'supplier' },
            ],
        },

        { path: 'resource' },
        {
            path: 'asset',
        },
        {
            path: 'customer',
        },
        {
            path: 'createdBy',
            populate: [
                {
                    path: 'company',
                },
            ],
        },
    ]);
};
const getAssetMaintenanceByIdNotPopulate = async (id) => {
    const assetMaintenance = await AssetMaintenance.findById(id);
    if (!assetMaintenance) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AssetMaintenance not found');
    }
    return assetMaintenance;
};

const getAssetMaintenance = async (id) => {
    console.log('id', id);
    const assetMaintenance = await AssetMaintenance.findById(id).populate([
        {
            path: 'assetModel',
            populate: [
                {
                    path: 'asset',
                },
                { path: 'manufacturer' },
                { path: 'subCategory' },
                { path: 'category' },
                { path: 'assetTypeCategory' },
                { path: 'supplier' },
            ],
        },

        { path: 'resource' },
        {
            path: 'asset',
        },
        {
            path: 'customer',
        },
        {
            path: 'createdBy',
            populate: [
                {
                    path: 'company',
                },
            ],
        },
    ]);
    return assetMaintenance;
};
const updateAssetMaintenanceById = async (id, updateBody) => {
    const assetMaintenance = await getAssetMaintenanceById(id);
    if (!assetMaintenance) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AssetMaintenance not found');
    }
    Object.assign(assetMaintenance, updateBody);
    await assetMaintenance.save();
    return assetMaintenance;
};
const updateStatus = async (id, updateBody) => {
    const assetMaintenance = await getAssetMaintenanceById(id);
    if (!assetMaintenance) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AssetMaintenance not found');
    }
    Object.assign(assetMaintenance, updateBody);
    await assetMaintenance.save();
    return assetMaintenance;
};
const deleteAssetMaintenanceById = async (id) => {
    const assetMaintenance = await getAssetMaintenanceById(id);
    if (!assetMaintenance) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AssetMaintenance not found');
    }

    await assetMaintenance.remove();
    return assetMaintenance;
};
const getAssetModelById = async (id) => {
    return AssetModel.findById(id);
};

const deleteAssetModelById = async (id) => {
    const assetModel = await getAssetModelById(id);
    if (!assetModel) {
        throw new ApiError(httpStatus.NOT_FOUND, 'assetModel not found');
    }
    await assetModel.remove();
    return assetModel;
};
const getAllAssetMaintenance = async () => {
    const assetMaintenances = await AssetMaintenance.find();
    return assetMaintenances;
};

const getAllDepreciationBase = async () => {
    const depreciationBase = await DepreciationBase.find();
    return depreciationBase;
};
const getAllDepreciationType = async () => {
    const depreciationType = await DepreciationType.find();
    return depreciationType;
};
const getAssetModelByRes = async (filter) => {
    if (!filter.asset) return [];
    const assetModels = await AssetModel.find(filter);
    return assetModels;
};
const getAssetModelByIdAssetMaintenance = async (id) => {
    const assetModel = await AssetModel.findOne({ assetMaintenanceId: id });
    return assetModel;
};
const getAllAssetModel = async () => {
    const assetModels = await AssetModel.find();
    return assetModels;
};
const getAssetMaintenanceByRes = async (filter) => {
    // Nếu filter có category hoặc manufacturer thì tìm AssetModel trước
    if (filter.category || filter.manufacturer || filter.assetStyle) {
        const assetFilter = {};
        if (filter.category) assetFilter.category = filter.category;
        if (filter.manufacturer) assetFilter.manufacturer = filter.manufacturer;
        const assets = await Asset.find(assetFilter).select('_id');
        const assetIds = assets.map((model) => model._id);
        if (filter.assetStyle) assetFilter.assetStyle = Number(filter.assetStyle); // Chuyển về Number
        // eslint-disable-next-line no-param-reassign
        filter.assetId = { $in: assetIds };
        // eslint-disable-next-line no-param-reassign
        delete filter.category;
        // eslint-disable-next-line no-param-reassign
        delete filter.manufacturer;
        // eslint-disable-next-line no-param-reassign
        delete filter.assetStyle;
    }
    const assetMaintenances = await AssetMaintenance.find(filter).populate([
        {
            path: 'assetModelId',
            select: 'assetModelName',
        },
        {
            path: 'assetId',
            select: 'assetName category manufacturer',
            populate: [
                { path: 'category', select: 'categoryName' },
                { path: 'manufacturer', select: 'manufacturerName' },
            ],
        },
        {
            path: 'customerId',
            select: 'customerName',
        },
    ]);

    return assetMaintenances;
};
const createAssetMaintenanceLocationHistory = async (data) => {
    return AssetMaintenanceLocationHistoryModel.create(data);
};
const getAssetMaintenanceLocationHistoryByRes = async (resquest) => {
    return AssetMaintenanceLocationHistoryModel.find(resquest).populate([
        {
            path: 'assetMaintenance',
            populate: [{ path: 'customer' }, { path: 'updatedBy' }],
        },
        { path: 'province' },
        { path: 'commune' },
        { path: 'building' },
        { path: 'floor' },
        { path: 'department' },
        { path: 'branch' },
        { path: 'oldProvince' },
        { path: 'oldCommune' },
        { path: 'oldBuilding' },
        { path: 'oldFloor' },
        { path: 'oldDepartment' },
        { path: 'oldBranch' },
        { path: 'customer' },
        { path: 'oldCustomer' },
        { path: 'createdBy' },
    ]);
};
const calcularDowntimeOfAssetMaintenance = async (assetMaintenanceId, startDate, endDate) => {
    let totalTime = 0;
    const assetMaintenance = await AssetMaintenance.findById(assetMaintenanceId);
    if (!assetMaintenance) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AssetMaintenance not found');
    }
    if (!startDate) return (totalTime = 0);
    const filter = {
        assetMaintenance: assetMaintenanceId,
        startDate: { $gte: new Date(startDate) }, //`${year}-12-31T23:59:59.999Z` lấy ngày hiện tại ( tính từ đầu năm đến hiện tại )
    };
    if (endDate) {
        filter.startDate.$lte = new Date(endDate);
    }
    const assetMaintenanceIsNotActiveHistorys = await AssetMaintenanceIsNotActiveHistoryModel.find(filter);
    for (const assetMaintenanceIsNotActiveHistory of assetMaintenanceIsNotActiveHistorys) {
        if (assetMaintenanceIsNotActiveHistory.endDate === null) {
            totalTime += new Date() - new Date(assetMaintenanceIsNotActiveHistory.startDate);
        } else {
            totalTime += assetMaintenanceIsNotActiveHistory.time;
        }
    }
    return totalTime;
};
const calcularDowntimeOfAssetMaintenanceShowStartEndTime = async (assetMaintenanceId, startDate, endDate, year) => {
    let totalTime = 0;
    const assetMaintenance = await AssetMaintenance.findById(assetMaintenanceId);
    if (!assetMaintenance) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AssetMaintenance not found');
    }
    if (!startDate) return { time: 0, data: [] };

    const filter = {
        assetMaintenance: assetMaintenanceId,
        startDate: { $gte: new Date(startDate) },
    };

    if (endDate) {
        filter.startDate.$lte = new Date(endDate);
    }

    const histories = await AssetMaintenanceIsNotActiveHistoryModel.find(filter);
    const data = [];

    for (const history of histories) {
        let duration = 0;
        if (history.endDate === null) {
            duration = new Date() - new Date(history.startDate);
            history.endDate = new Date();
        } else {
            duration = history.time ?? new Date(history.endDate) - new Date(history.startDate);
        }

        totalTime += duration;
        data.push({
            ...history.toObject(),
            duration,
            year,
        });
    }

    return {
        time: totalTime,
        data,
    };
};
const calcularDowntimeOfAssetMaintenances = async (assetMaintenanceIds, startDate, endDate) => {
    let totalTime = 0;
    if (!startDate) return (totalTime = 0);
    const filter = {
        assetMaintenance: { $in: assetMaintenanceIds },
        startDate: { $gte: new Date(startDate) },
    };
    if (endDate) {
        filter.startDate.$lte = new Date(endDate);
    }
    const assetMaintenanceIsNotActiveHistorys = await AssetMaintenanceIsNotActiveHistoryModel.find(filter);
    for (const assetMaintenanceIsNotActiveHistory of assetMaintenanceIsNotActiveHistorys) {
        if (assetMaintenanceIsNotActiveHistory.endDate === null) {
            totalTime += new Date() - new Date(assetMaintenanceIsNotActiveHistory.startDate);
        } else {
            totalTime += assetMaintenanceIsNotActiveHistory.time;
        }
    }
    return totalTime;
};
// tổng thời gian chết của thiết bị
const totalEquipmentDowntime = async (assetMaintenanceId, year) => {
    let totalTime = 0;
    const assetMaintenance = await AssetMaintenance.findById(assetMaintenanceId);
    if (!assetMaintenance) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AssetMaintenance not found');
    }
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date();
    totalTime = await calcularDowntimeOfAssetMaintenance(assetMaintenanceId, startDate, endDate);
    return totalTime;
};
const getAssetSummary = async () => {
    const breakdown = await Breakdown.aggregate([
        {
            $match: {
                ticketStatus: { $nin: ['cloesed', 'completed'] },
            },
        },
        {
            $group: { _id: '$assetMaintenance' },
        },
        {
            $count: 'totalAssets',
        },
    ]);

    const schedulePreventive = await SchedulePreventive.aggregate([
        { $group: { _id: '$assetMaintenance' } },
        { $count: 'totalAssets' },
    ]);

    const total = await AssetMaintenance.countDocuments();
    return {
        breakdown: breakdown[0]?.totalAssets,
        schedulePreventive: schedulePreventive[0]?.totalAssets,
        total,
    };
};
const getDowntimeBreakdownAssetMaintenanceByRes = async (assetMaintenanceIds, startDate, endDate) => {
    const breakdowns = await Breakdown.find({
        assetMaintenance: { $in: assetMaintenanceIds },
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    let downtime = await breakdownService.workingTimeBreakdowns(breakdowns.map((b) => b._id));
    return downtime;
};

const getAssetMaintenanceDueInspections = async (companyId, options, filters = {}) => {
    const notificationSetting = await NotificationSettingModel.findOne({ company: companyId });

    let nextInspectionDate;
    if (filters.nextInspectionDate) {
        if (
            new Date(filters.nextInspectionDate) < new Date().setHours(0, 0, 0, 0) ||
            new Date(filters.nextInspectionDate) >
            new Date(
                new Date().setDate(new Date().getDate() + (notificationSetting?.preInspectionNotificationDays || 0))
            )
        ) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Ngày tìm kiếm phải trong khoảng từ hôm nay đến ${new Date(
                    new Date().setDate(new Date().getDate() + (notificationSetting?.preInspectionNotificationDays || 0))
                ).toLocaleDateString()} ! `
            );
        }
        nextInspectionDate = {
            $gte: new Date(filters.nextInspectionDate),
            $lte: new Date(filters.nextInspectionDate),
        };
        delete filters.nextInspectionDate;
    } else {
        nextInspectionDate = {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(
                new Date().setDate(new Date().getDate() + (notificationSetting?.preInspectionNotificationDays || 0))
            ),
        };
    }
    const assetMaintenances = await AssetMaintenance.paginate(
        {
            nextInspectionDate,
            ...filters,
        },
        { ...options, populate: ['asset', 'assetModel', 'customer'] }
    );
    return assetMaintenances;
};

const updateData = async () => {
    const [
        assetMaintenance,
        assetModels,
        assets,
        assetTypes,
        categories,
        manufacturers,
        subCategories,
        customers
    ] = await Promise.all([
        AssetMaintenance.find(),
        AssetModel.find(),
        Asset.find(),
        AssetTypeCategoryModel.find(),
        Category.find(),
        Manufacturer.find(),
        SubCategory.find(),
        Customer.find(),
    ]);

    const mapAssetModel = new Map(assetModels.map(x => [String(x._id), x]));
    const mapAsset = new Map(assets.map(x => [String(x._id), x]));
    const mapAssetType = new Map(assetTypes.map(x => [String(x._id), x]));
    const mapCategory = new Map(categories.map(x => [String(x._id), x]));
    const mapManufacturer = new Map(manufacturers.map(x => [String(x._id), x]));
    const mapSubCategory = new Map(subCategories.map(x => [String(x._id), x]));
    const mapCustomer = new Map(customers.map(x => [String(x._id), x]));

    const bulk = [];

    for (const a of assetMaintenance) {
        const dataUpdate = {};

        // assetModel
        const assetModel = mapAssetModel.get(String(a.assetModel));
        if (assetModel) {
            dataUpdate.assetModelName = assetModel.assetModelName;

            const asset = mapAsset.get(String(assetModel.asset));
            if (asset) dataUpdate.assetName = asset.assetName;

            const type = mapAssetType.get(String(assetModel.assetTypeCategory));
            if (type) dataUpdate.assetTypeCategory = type.name;

            const cat = mapCategory.get(String(assetModel.category));
            if (cat) dataUpdate.categoryName = cat.categoryName;

            const manu = mapManufacturer.get(String(assetModel.manufacturer));
            if (manu) dataUpdate.manufacturerName = manu.manufacturerName;

            const sub = mapSubCategory.get(String(assetModel.subCategory));
            if (sub) dataUpdate.subCategoryName = sub.subCategoryName;
        }

        // customer
        const cus = mapCustomer.get(String(a.customer));
        if (cus) dataUpdate.customerName = cus.customerName;

        // bulk update
        bulk.push({
            updateOne: {
                filter: { _id: a._id },
                update: { $set: dataUpdate }
            }
        });
    }

    if (bulk.length > 0) {
        await AssetMaintenance.bulkWrite(bulk, { ordered: false });
    }
};

const getAssetMaintenanceMobile = async (filter, options) => {

    const assetMaintenances = await AssetMaintenance.paginate(filter, {
        ...options,
        populate: [
            { path: 'resource' },
        ],
    });


    return assetMaintenances;
}



module.exports = {
    queryAssetMaintenances,
    getAssetMaintenanceById,
    updateAssetMaintenanceById,
    deleteAssetMaintenanceById,
    createAssetMaintenance,
    updateStatus,
    getAllAssetMaintenance,
    getAllDepreciationBase,
    getAllDepreciationType,
    getAssetModelByRes,
    createAssetModel,
    getAssetModelByIdAssetMaintenance,
    deleteAssetModelById,
    getAssetModelById,
    getAssetMaintenanceByData,
    getAssetMaintenanceByQrCode,
    getAssetModelByName,
    getAllAssetModel,
    getAssetMaintenanceByRes,
    getAssetMaintenance,
    createAssetMaintenanceLocationHistory,
    getAssetMaintenanceLocationHistoryByRes,
    totalEquipmentDowntime,
    getAssetSummary,
    getAssetMaintenanceByIdNotPopulate,
    getDowntimeBreakdownAssetMaintenanceByRes,
    getAssetMaintenanceDueInspections,
    calcularDowntimeOfAssetMaintenance,
    calcularDowntimeOfAssetMaintenances,
    calcularDowntimeOfAssetMaintenanceShowStartEndTime,
    updateData,
    getAssetMaintenanceMobile,
};
