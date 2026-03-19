const httpStatus = require('http-status');
const { AssetModelSolutionModel, AssetModelSolutionTagModel } = require('../../models');
const ApiError = require('../../utils/ApiError');

const createAssetModelSolution = async (_assetModelSolution, tags) => {
    const assetModelSolution = await AssetModelSolutionModel.create(_assetModelSolution);
    // 
    if (tags && tags.length > 0) {
        tags.forEach(item => {
            item.assetModelSolution = assetModelSolution._id;
        });
        await AssetModelSolutionTagModel.insertMany(tags);
    }
    return assetModelSolution;
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
const queryAssetModelSolutions = async (filter, options) => {
    const assets = await AssetModelSolutionModel.paginate(filter, options);
    return assets;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getAssetModelSolutionById = async (id) => {
    return AssetModelSolutionModel.findById(id);
};

const updateAssetModelSolutionById = async (id, _assetModelSolution, tags) => {
    const assetModelSolution = await getAssetModelSolutionById(id);
    if (!assetModelSolution) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
    }
    Object.assign(assetModelSolution, _assetModelSolution);
    // xóa dữ liệu cũ
    await AssetModelSolutionTagModel.deleteMany({ assetModelSolution: id })
    if (tags && tags.length > 0) {
        tags.forEach(item => {
            item.assetModelSolution = assetModelSolution._id;
        });
        await AssetModelSolutionTagModel.insertMany(tags);
    }
    await assetModelSolution.save();
    return assetModelSolution;
};
const deleteAssetModelSolutionById = async (id) => {
    const assetModelSolution = await getAssetModelSolutionById(id);
    if (!assetModelSolution) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
    }
    await AssetModelSolutionTagModel.deleteMany({ assetModelSolution: id })

    await assetModelSolution.remove();
    return assetModelSolution;
};

const getAllAssetModelSolution = async (filter) => {
    const assetModelSolutions = await AssetModelSolutionModel.find(filter).populate([{
        path: 'assetModelFailureType'
    }]);
    return assetModelSolutions;
};
const updateStatus = async (id) => {
    const assetModelSolution = await getAssetModelSolutionById(id);
    if (!assetModelSolution) {
        throw new ApiError(httpStatus.NOT_FOUND, 'assetModelSolution not found');
    }
    Object.assign(assetModelSolution, { status: !assetModelSolution });
    await assetModelSolution.save();
    return assetModelSolution;
};
const getTagsBySolutionId = async (SolutionId) => {
    const tags = await AssetModelSolutionTagModel.find({ assetModelSolution: SolutionId });
    return tags;
};
module.exports = {
    queryAssetModelSolutions,
    getAssetModelSolutionById,
    updateAssetModelSolutionById,
    deleteAssetModelSolutionById,
    createAssetModelSolution,
    getAllAssetModelSolution,
    getTagsBySolutionId,
    updateStatus
};
