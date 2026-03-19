const fs = require("fs");
const path = require("path");
const httpStatus = require('http-status');
const { ResourceImportDataModel, Manufacturer, Category, Asset, Supplier, Customer, AssetTypeCategoryModel, SubCategory, AssetModel, AssetMaintenance } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { sourceSave } = require('../../utils/constant');

const createResourceImportData = async (resource) => {
    const create = await ResourceImportDataModel.create(resource);
    return create;
};
const deleteResourceImportDataById = async (id) => {
    const deledeResourceImportData = await ResourceImportDataModel.findByIdAndDelete(id);
    return deledeResourceImportData;
};
const getResourceImportDataById = async (id) => {
    const resourceImportData = await ResourceImportDataModel.findById(id);
    return resourceImportData;
};
const getListResourceImportDataAssetMaintenance = async (filter, options) => {
    filter.sourceSave = sourceSave.ASSETMAINTENANCE;

    const resourceImportDataAssetMaintenances = await ResourceImportDataModel.paginate(filter, options)
    return resourceImportDataAssetMaintenances;
}

const confirmCloseFileDeletion = async (_id, updateBody) => {
    const resourceImportData = await ResourceImportDataModel.findByIdAndUpdate(_id, updateBody);
    if (!resourceImportData) {
        throw new ApiError(httpStatus.NOT_FOUND, 'resourceImportData not found');
    }
    return resourceImportData;
};
const confirmDeleteFile = async (_id) => {
    const resourceImportData = await ResourceImportDataModel.findByIdAndDelete(_id);
    if (!resourceImportData) {
        throw new ApiError(httpStatus.NOT_FOUND, 'resourceImportData not found');
    }
    await Manufacturer.deleteMany({ resourceImportData: _id });
    await Category.deleteMany({ resourceImportData: _id });
    await Asset.deleteMany({ resourceImportData: _id });
    await Supplier.deleteMany({ resourceImportData: _id });
    await Customer.deleteMany({ resourceImportData: _id });
    await AssetTypeCategoryModel.deleteMany({ resourceImportData: _id });
    await SubCategory.deleteMany({ resourceImportData: _id });
    await AssetModel.deleteMany({ resourceImportData: _id });
    await AssetMaintenance.deleteMany({ resourceImportData: _id });
    const uploadDir = path.join(__dirname, "../../../uploads");
    const absolutePath = path.join(uploadDir, path.basename(resourceImportData.filePath));

    if (fs.existsSync(absolutePath)) {
        try {
            await fs.promises.unlink(absolutePath);
        } catch (err) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Không thể xóa file trên server");
        }
    } else {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "File không tồn tại");
    }

    return resourceImportData;
};
module.exports = {
    createResourceImportData,
    deleteResourceImportDataById,
    getResourceImportDataById,
    getListResourceImportDataAssetMaintenance,
    confirmCloseFileDeletion,
    confirmDeleteFile,
};
