const httpStatus = require('http-status');
const { AssetModelFailureTypeModel, AssetModelSeftDiagnosiaModel, AssetModelSolutionModel } = require('../../models');
const ApiError = require('../../utils/ApiError');

const createAssetModelFailureType = async (_assetModelFailureType) => {
    return AssetModelFailureTypeModel.create(_assetModelFailureType);
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
const queryAssetModelFailureTypes = async (filter, options) => {
    const assets = await AssetModelFailureTypeModel.paginate(filter, options);
    return assets;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getAssetModelFailureTypeById = async (id) => {
    return AssetModelFailureTypeModel.findById(id);
};
const getAssetModelFailureTypesUnusedSeftDiagnosia = async (modelId, ignoreIds = []) => {
    const assetModelSeftDiagnosias = await AssetModelSeftDiagnosiaModel.find({ assetModel: modelId });
    const typeIdsUsed = assetModelSeftDiagnosias.map((_item) => _item.assetModelFailureType);
    const assetModelFailureTypes = await AssetModelFailureTypeModel.find({
        assetModel: modelId, $or: [
            {
                _id: { "$nin": typeIdsUsed }
            }, {
                _id: { "$in": ignoreIds }
            }
        ]
    });
    return assetModelFailureTypes;
};
const getAssetModelFailureTypesUnusedSolution = async (modelId, ignoreIds = []) => {
    const assetModelSolutions = await AssetModelSolutionModel.find({ assetModel: modelId });
    const typeIdsUsed = assetModelSolutions.map((_item) => _item.assetModelFailureType);
    const assetModelFailureTypes = await AssetModelFailureTypeModel.find({
        assetModel: modelId, $or: [
            {
                _id: { "$nin": typeIdsUsed }
            }, {
                _id: { "$in": ignoreIds }
            }
        ]
    });
    return assetModelFailureTypes;
};
const updateAssetModelFailureTypeById = async (id, updateBody) => {
    const assetModelFailureType = await getAssetModelFailureTypeById(id);
    if (!assetModelFailureType) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
    }
    Object.assign(assetModelFailureType, updateBody);
    await assetModelFailureType.save();
    return assetModelFailureType;
};
const deleteAssetModelFailureTypeById = async (id) => {
    const assetModelFailureType = await getAssetModelFailureTypeById(id);
    if (!assetModelFailureType) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
    }
    await assetModelFailureType.remove();
    return assetModelFailureType;
};

const getAllAssetModelFailureType = async (filter) => {
    const assetModelFailureTypes = await AssetModelFailureTypeModel.find(filter);
    return assetModelFailureTypes;
};

module.exports = {
    queryAssetModelFailureTypes,
    getAssetModelFailureTypeById,
    updateAssetModelFailureTypeById,
    deleteAssetModelFailureTypeById,
    createAssetModelFailureType,
    getAllAssetModelFailureType,
    getAssetModelFailureTypesUnusedSeftDiagnosia,
    getAssetModelFailureTypesUnusedSolution,

};
