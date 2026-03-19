const httpStatus = require('http-status');
const {
    AmcModel,
    AmcSparePartModel,
    AmcServiceModel,
    AmcServiceTaskModel,
    AmcAttachmentsModel,
    RepairContractModel,
    RepairContractSparePartModel,
    RepairContractAttachmentsModel,
    RepairContractMappingAssetMaintenanceModel,
} = require('../../models');
const ApiError = require('../../utils/ApiError');
const { populate } = require('../../models/authentication/token.model');
const { amcState } = require('../../utils/constant');

const createRepairContract = async (_repairContract, _spareParts, _listResource) => {
    const repairContract = await RepairContractModel.create(_repairContract);
    if (_spareParts && _spareParts.length > 0) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < _spareParts.length; index++) {
            const element = _spareParts[index];
            element.repairContract = repairContract._id;
            element._id = undefined;
            // eslint-disable-next-line no-await-in-loop
            await RepairContractSparePartModel.create(element);
        }
    }
    // thêm list danh sách tài liệu
    if (_listResource && _listResource.length > 0) {
        for (let index = 0; index < _listResource.length; index++) {
            const element = _listResource[index];
            element.repairContract = repairContract._id;
            // eslint-disable-next-line no-await-in-loop
            await RepairContractAttachmentsModel.create(element);
        }
    }
    return repairContract;
};
const getRepairContracts = async (filter, options) => {
    const repairContracts = await RepairContractModel.paginate(filter, options);
    return repairContracts;
};
const getRepairContractById = async (id) => {
    const repairContract = await RepairContractModel.findById(id);
    if (!repairContract) {
        throw new Error('repairContract not found');
    }
    return repairContract;
};
const deleteRepairContractById = async (id) => {
    const repairContract = await RepairContractModel.findById(id);
    if (!repairContract) {
        throw new Error('repairContract not found');
    }
    // xóa các bảng phụ
    await RepairContractSparePartModel.deleteMany({ repairContract: repairContract?._id });
    await RepairContractAttachmentsModel.deleteMany({ repairContract: repairContract?._id });
    await RepairContractMappingAssetMaintenanceModel.deleteMany({ repairContract: repairContract?._id });
    await repairContract.remove();
    return repairContract;
};
const updateRepairContractById = async (id, data, _spareParts, _listResource) => {
    const repairContract = await RepairContractModel.findById(id);
    if (!repairContract) {
        throw new Error('repairContract not found');
    }
    Object.assign(repairContract, data);
    await repairContract.save();

    // xóa các bảng phụ
    await RepairContractSparePartModel.deleteMany({ repairContract: repairContract?._id });
    await RepairContractAttachmentsModel.deleteMany({ repairContract: repairContract?._id });
    // thêm lại
    if (_spareParts && _spareParts.length > 0) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < _spareParts.length; index++) {
            const element = _spareParts[index];
            element.repairContract = repairContract._id;
            element._id = undefined;
            // eslint-disable-next-line no-await-in-loop
            await RepairContractSparePartModel.create(element);
        }
    }
    // thêm list danh sách tài liệu
    if (_listResource && _listResource.length > 0) {
        for (let index = 0; index < _listResource.length; index++) {
            const element = _listResource[index];
            element.repairContract = repairContract._id;
            // eslint-disable-next-line no-await-in-loop
            await RepairContractAttachmentsModel.create(element);
        }
    }
    return repairContract;
};
const getRepairContractAttachments = async (repairContractId) => {
    const repairContractAttachments = await RepairContractAttachmentsModel.find({ repairContract: repairContractId })
        .populate({ path: 'resource' })
        .sort({ createdAt: -1 });
    return repairContractAttachments;
};
const getRepairContractSpareParts = async (repairContractId) => {
    const repairContractSpareParts = await RepairContractSparePartModel.find({ repairContract: repairContractId }).sort({
        createdAt: -1,
    });
    return repairContractSpareParts;
};
const createRepairContractMappingAssetMaintenance = async (data) => {
    if (data && data?.repairContract && data?.assetMaintenance) {
        const repairContractMappingAssetMaintenances = await RepairContractMappingAssetMaintenanceModel.countDocuments({
            assetMaintenance: data?.assetMaintenance,
            repairContract: data?.repairContract,
        });
        if (repairContractMappingAssetMaintenances && repairContractMappingAssetMaintenances > 0) {
            throw new Error('Hợp đồng này đã liên kết với tài sản này');
        }
    }
    const createRepairContractMappingAssetMaintenance = await RepairContractMappingAssetMaintenanceModel.create(data);
    return createRepairContractMappingAssetMaintenance;
};
const getRepairContractMappingAssetMaintenancesByRes = async (data) => {
    const repairContractMappingAssetMaintenances = await RepairContractMappingAssetMaintenanceModel.find(data)
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
        ])
        .sort({
            createdAt: -1,
        });
    return repairContractMappingAssetMaintenances;
};
const deleteRepairContractMappingAssetMaintenancesById = async (id) => {
    const repairContractMappingAssetMaintenance = await RepairContractMappingAssetMaintenanceModel.findById(id);
    if (!repairContractMappingAssetMaintenance) {
        throw new Error('repairContractMappingAssetMaintenance not found');
    }
    await repairContractMappingAssetMaintenance.remove();
    return repairContractMappingAssetMaintenance;
};
const getAllRepairContractByRes = async (data) => {
    // if (!data || !data.assetMaintenance) {
    //     repairContracts = {};
    // }
    const repairContractMappingAssetMaintenance = await RepairContractMappingAssetMaintenanceModel.find({
        assetMaintenance: data.assetMaintenance,
    });
    const repairContractIds = repairContractMappingAssetMaintenance.map((item) => item.repairContract);
    const repairContracts = await RepairContractModel.find({
        _id: { $in: repairContractIds },
    });
    return repairContracts;
};

module.exports = {
    createRepairContract,
    getRepairContracts,
    getRepairContractById,
    deleteRepairContractById,
    updateRepairContractById,
    getRepairContractAttachments,
    getRepairContractSpareParts,
    createRepairContractMappingAssetMaintenance,
    getRepairContractMappingAssetMaintenancesByRes,
    deleteRepairContractMappingAssetMaintenancesById,
    getAllRepairContractByRes,
};
