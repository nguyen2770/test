const httpStatus = require('http-status');
const { AssetModelSeftDiagnosiaModel, AssetModelSeftDiagnosiaAnswerValueModel, AssetModelSeftDiagnosiaTagModel } = require('../../models');
const ApiError = require('../../utils/ApiError');

const createAssetModelSeftDiagnosia = async (_assetModelSeftDiagnosia, tags, assetModelSeftDiagnosiaAnswerValues) => {
    const assetModelSeftDiagnosia = await AssetModelSeftDiagnosiaModel.create(_assetModelSeftDiagnosia);
    //
    if (tags && tags.length > 0) {
        tags.forEach(item => {
            item.assetModelSeftDiagnosia = assetModelSeftDiagnosia._id;
        });
        await AssetModelSeftDiagnosiaTagModel.insertMany(tags);
    }
    if (assetModelSeftDiagnosiaAnswerValues && assetModelSeftDiagnosiaAnswerValues.length > 0) {
        assetModelSeftDiagnosiaAnswerValues.forEach(item => {
            item.assetModelSeftDiagnosia = assetModelSeftDiagnosia._id;
        });
        await AssetModelSeftDiagnosiaAnswerValueModel.insertMany(assetModelSeftDiagnosiaAnswerValues);
    }
    return assetModelSeftDiagnosia;
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
const queryAssetModelSeftDiagnosias = async (filter, options) => {
    const assets = await AssetModelSeftDiagnosiaModel.paginate(filter, options);
    return assets;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getAssetModelSeftDiagnosiaById = async (id) => {
    return AssetModelSeftDiagnosiaModel.findById(id);
};

const updateAssetModelSeftDiagnosiaById = async (id, _assetModelSeftDiagnosia, tags, assetModelSeftDiagnosiaAnswerValues) => {
    const assetModelSeftDiagnosia = await getAssetModelSeftDiagnosiaById(id);
    if (!assetModelSeftDiagnosia) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
    }
    Object.assign(assetModelSeftDiagnosia, _assetModelSeftDiagnosia);
    // xóa dữ liệu cũ
    await AssetModelSeftDiagnosiaTagModel.deleteMany({ assetModelSeftDiagnosia: id })
    await AssetModelSeftDiagnosiaAnswerValueModel.deleteMany({ assetModelSeftDiagnosia: id })
    if (tags && tags.length > 0) {
        tags.forEach(item => {
            item.assetModelSeftDiagnosia = assetModelSeftDiagnosia._id;
        });
        await AssetModelSeftDiagnosiaTagModel.insertMany(tags);
    }
    if (assetModelSeftDiagnosiaAnswerValues && assetModelSeftDiagnosiaAnswerValues.length > 0) {
        assetModelSeftDiagnosiaAnswerValues.forEach(item => {
            item.assetModelSeftDiagnosia = assetModelSeftDiagnosia._id;
        });
        await AssetModelSeftDiagnosiaAnswerValueModel.insertMany(assetModelSeftDiagnosiaAnswerValues);
    }
    await assetModelSeftDiagnosia.save();
    return assetModelSeftDiagnosia;
};
const deleteAssetModelSeftDiagnosiaById = async (id) => {
    const assetModelSeftDiagnosia = await getAssetModelSeftDiagnosiaById(id);
    if (!assetModelSeftDiagnosia) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
    }
    await AssetModelSeftDiagnosiaTagModel.deleteMany({ assetModelSeftDiagnosia: id })
    await AssetModelSeftDiagnosiaAnswerValueModel.deleteMany({ assetModelSeftDiagnosia: id })

    await assetModelSeftDiagnosia.remove();
    return assetModelSeftDiagnosia;
};

const getAllAssetModelSeftDiagnosia = async (filter) => {
    const assetModelSeftDiagnosias = await AssetModelSeftDiagnosiaModel.find(filter).populate([{
        path: 'assetModelFailureType'
    }]);
    return assetModelSeftDiagnosias;
};
const updateStatus = async (id) => {
    const assetModelSeftDiagnosia = await getAssetModelSeftDiagnosiaById(id);
    if (!assetModelSeftDiagnosia) {
        throw new ApiError(httpStatus.NOT_FOUND, 'assetModelSeftDiagnosia not found');
    }
    Object.assign(assetModelSeftDiagnosia, { status: !assetModelSeftDiagnosia });
    await assetModelSeftDiagnosia.save();
    return assetModelSeftDiagnosia;
};
const getTagsBySeftDIagnosiaId = async (seftDIagnosiaId) => {
    const tags = await AssetModelSeftDiagnosiaTagModel.find({ assetModelSeftDiagnosia: seftDIagnosiaId });
    return tags;
};
const getValuesBySeftDIagnosiaId = async (seftDIagnosiaId) => {
    const values = await AssetModelSeftDiagnosiaAnswerValueModel.find({ assetModelSeftDiagnosia: seftDIagnosiaId });
    return values;
};
module.exports = {
    queryAssetModelSeftDiagnosias,
    getAssetModelSeftDiagnosiaById,
    updateAssetModelSeftDiagnosiaById,
    deleteAssetModelSeftDiagnosiaById,
    createAssetModelSeftDiagnosia,
    getAllAssetModelSeftDiagnosia,
    getTagsBySeftDIagnosiaId,
    updateStatus,
    getValuesBySeftDIagnosiaId
};
