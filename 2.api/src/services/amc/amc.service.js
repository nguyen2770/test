const httpStatus = require('http-status');
const {
    AmcModel,
    AmcSparePartModel,
    AmcServiceModel,
    AmcServiceTaskModel,
    AmcAttachmentsModel,
    ServiceContractorModel,
    AmcMappingAssetMaintenanceModel,
    ServiceTaskModel,
} = require('../../models');
const ApiError = require('../../utils/ApiError');
const { populate } = require('../../models/authentication/token.model');
const { amcState } = require('../../utils/constant');

const createAmc = async (_amc, _amcSpareParts, _amcServices, _listResource) => {
    const amc = await AmcModel.create(_amc);
    if (_amcSpareParts && _amcSpareParts.length > 0) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < _amcSpareParts.length; index++) {
            const element = _amcSpareParts[index];
            element.amc = amc._id;
            element._id = undefined;
            // eslint-disable-next-line no-await-in-loop
            const amcTask = await AmcSparePartModel.create(element);
        }
    }
    if (_amcServices && _amcServices.length > 0) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < _amcServices.length; index++) {
            const element = _amcServices[index];
            element.amc = amc._id;
            element._id = undefined;
            // eslint-disable-next-line no-await-in-loop
            const amcService = await AmcServiceModel.create(element);
            if (element.amcServiceTasks && element.amcServiceTasks.length > 0) {
                // eslint-disable-next-line no-plusplus
                for (let j = 0; j < element.amcServiceTasks.length; j++) {
                    const _item = element.amcServiceTasks[j];
                    _item.amcService = amcService._id;
                    _item.amc = amc._id;
                    _item._id = undefined;
                    // eslint-disable-next-line no-await-in-loop
                    await AmcServiceTaskModel.create(_item);
                }
            }
        }
    }
    // thêm list danh sách tài liệu
    if (_listResource && _listResource.length > 0) {
        for (let index = 0; index < _listResource.length; index++) {
            const element = _listResource[index];
            element.amc = amc._id;
            // eslint-disable-next-line no-await-in-loop
            await AmcAttachmentsModel.create(element);
        }
    }
    return amc;
};
const updateAmcById = async (_id, _amc, _amcSpareParts, _amcServices, _listResource) => {
    // eslint-disable-next-line no-use-before-define
    const amc = await getAmcById(_id);
    if (!amc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'amc not found');
    }

    Object.assign(amc, _amc);
    // xóa dữ liệu cũ của task detail
    await AmcSparePartModel.deleteMany({ amc: _id });
    await AmcServiceModel.deleteMany({ amc: _id });
    await AmcServiceTaskModel.deleteMany({ amc: _id });
    await AmcAttachmentsModel.deleteMany({ amc: _id });
    if (_amcSpareParts && _amcSpareParts.length > 0) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < _amcSpareParts.length; index++) {
            const element = _amcSpareParts[index];
            element.amc = amc._id;
            // eslint-disable-next-line no-await-in-loop
            await AmcSparePartModel.create(element);
        }
    }
    if (_amcServices && _amcServices.length > 0) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < _amcServices.length; index++) {
            const element = _amcServices[index];
            element.amc = amc._id;
            // eslint-disable-next-line no-await-in-loop
            const amcService = await AmcServiceModel.create(element);
            if (element.amcServiceTasks && element.amcServiceTasks.length > 0) {
                // eslint-disable-next-line no-plusplus
                for (let j = 0; j < element.amcServiceTasks.length; j++) {
                    const _item = element.amcServiceTasks[j];
                    _item.amcService = amcService._id;
                    _item.amc = amc._id;
                    // eslint-disable-next-line no-await-in-loop
                    await AmcServiceTaskModel.create(_item);
                }
            }
        }
    }
    // thêm list danh sách tài liệu
    if (_listResource && _listResource.length > 0) {
        for (let index = 0; index < _listResource.length; index++) {
            const element = _listResource[index];
            element.amc = amc._id;
            // eslint-disable-next-line no-await-in-loop
            await AmcAttachmentsModel.create(element);
        }
    }
    await amc.save();
    return amc;
};

const queryAmcs = async (filter, options) => {
    // eslint-disable-next-line no-return-await
    const amcCategories = await AmcModel.paginate(filter, options);
    return amcCategories;
};
const getALlAmcs = async (data) => {
    // eslint-disable-next-line no-return-await
    const amcs = await AmcModel.find(data);
    return amcs;
};
const getAmcById = async (id) => {
    return AmcModel.findById(id);
};
const getAmcTaskByamcId = async (amcId) => {
    const amcTasks = await AmcModel.find({ amc: amcId });
    return amcTasks;
};
const deleteAmcById = async (id) => {
    const amc = await getAmcById(id);
    if (!amc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'amc not found');
    }
    await AmcSparePartModel.deleteMany({ amc: id });
    await AmcServiceModel.deleteMany({ amc: id });
    await AmcServiceTaskModel.deleteMany({ amc: id });
    await AmcAttachmentsModel.deleteMany({ amc: id });
    await amc.remove();
    return amc;
};
const getAmcSpareParts = async (amc, havePopulate) => {
    let spartParts = await AmcSparePartModel.find({ amc });
    if (havePopulate) {
        spartParts = await AmcSparePartModel.find({ amc }).populate([
            {
                path: 'sparePart',
            },
        ]);
    }
    return spartParts;
};
const getAmcAttachments = async (amc) => {
    let resources = await AmcAttachmentsModel.find({ amc }).populate([
        {
            path: 'resource',
        },
    ]);
    return resources;
};
const getAmcServices = async (amc, havePopulate) => {
    let amcServices = await AmcServiceModel.find({ amc });
    if (havePopulate) {
        amcServices = await AmcServiceModel.find({ amc }).populate([
            {
                path: 'assetModel',
                populate: [
                    {
                        path: 'asset',
                    },
                ],
            },
        ]);
    }
    return amcServices;
};
const getAmcServiceTasks = async (query) => {
    const serviceTasks = await AmcServiceTaskModel.find(query);
    return serviceTasks;
};
const totalAmcByState = async () => {
    const totalAmcStateNews = await AmcModel.countDocuments({ state: amcState.new });
    return { totalAmcStateNews };
};
const getServiceContractorById = async (id) => {
    const serviceContractor = await ServiceContractorModel.findById(id);
    return serviceContractor;
};
const createAmcMappingAssetMaintenance = async (data) => {
    const findData = await AmcMappingAssetMaintenanceModel.find(data);
    if (findData && findData.length > 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'AmcMappingAssetMaintenanceModel đã tồn tại');
    }
    const amcMappingAssetMaintenance = await AmcMappingAssetMaintenanceModel.create(data);
    return amcMappingAssetMaintenance;
};
const getAmcMappingAssetMaintenanceByRes = async (filter) => {
    const amcMappingAssetMaintenances = await AmcMappingAssetMaintenanceModel.find(filter)
        .populate([
            {
                path: 'assetMaintenance',
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
            },
            { path: 'amc' },
        ])
        .sort({ createdAt: -1 });
    return amcMappingAssetMaintenances;
};
const deleteAmcMappingAssetMaintenance = async (id) => {
    const amcMappingAssetMaintenance = await AmcMappingAssetMaintenanceModel.findById(id);
    if (!amcMappingAssetMaintenance) {
        throw new ApiError(httpStatus.NOT_FOUND, 'amcMappingAssetMaintenance not found');
    }
    amcMappingAssetMaintenance.remove();
    return amcMappingAssetMaintenance;
};
const getAmcServiceTasksByAmc = async (amc) => {
    const amcServiceTasks = await AmcServiceTaskModel.find({ amc });
    return amcServiceTasks;
};
const getAmcSparePartByAmc = async (amc) => {
    const amcSpareParts = await AmcSparePartModel.find({ amc });
    return amcSpareParts;
};
module.exports = {
    queryAmcs,
    createAmc,
    updateAmcById,
    getAmcById,
    deleteAmcById,
    getAmcTaskByamcId,
    getALlAmcs,
    getAmcSpareParts,
    getAmcServices,
    getAmcServiceTasks,
    totalAmcByState,
    getAmcAttachments,
    getServiceContractorById,
    createAmcMappingAssetMaintenance,
    getAmcMappingAssetMaintenanceByRes,
    deleteAmcMappingAssetMaintenance,
    getAmcServiceTasksByAmc,
    getAmcSparePartByAmc,
};
