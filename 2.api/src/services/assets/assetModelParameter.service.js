const httpStatus = require('http-status');
const { AssetModelParameterModel } = require('../../models');
const ApiError = require('../../utils/ApiError');

const createAssetModelParameter = async (_assetModelParameter) => {
    return AssetModelParameterModel.create(_assetModelParameter);
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
const queryAssetModelParameters = async (filter, options) => {
    const assets = await AssetModelParameterModel.paginate(filter, options);
    return assets;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getAssetModelParameterById = async (id) => {
    return AssetModelParameterModel.findById(id);
};

const updateAssetModelParameterById = async (id, updateBody) => {
    const assetModelParameter = await getAssetModelParameterById(id);
    if (!assetModelParameter) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
    }
    Object.assign(assetModelParameter, updateBody);
    await assetModelParameter.save();
    return assetModelParameter;
};
const deleteAssetModelParameterById = async (id) => {
    const assetModelParameter = await getAssetModelParameterById(id);
    if (!assetModelParameter) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
    }
    await assetModelParameter.remove();
    return assetModelParameter;
};

const getAllAssetModelParameter = async (filter) => {
    const assetModelParameters = await AssetModelParameterModel.find(filter);
    return assetModelParameters;
};
module.exports = {
    queryAssetModelParameters,
    getAssetModelParameterById,
    updateAssetModelParameterById,
    deleteAssetModelParameterById,
    createAssetModelParameter,
    getAllAssetModelParameter,
};
