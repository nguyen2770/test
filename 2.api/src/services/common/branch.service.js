const httpStatus = require('http-status');
const { Branch } = require('../../models');
const ApiError = require('../../utils/ApiError');


const createBranch = async (branch) => {
    const a = await Branch.create(branch)
    return a;
} 

const queryBranches = async (filter, options) => {
    const a = await Branch.paginate(filter, options);
    return a;
} 

const getBranchById = async (id) => {
    const a = await Branch.findById(id)
    return a;
} 
const updateBranchById = async (id, branch) => {
    const a = await Branch.findByIdAndUpdate(id,branch)
    return a;
} 
const deleteBranchById = async (id) => {
    const branch = await getBranchById(id);
    if (!branch) {
        throw new ApiError(httpStatus.NOT_FOUND, 'branch not found');
    }
    await branch.remove();
    return branch; 
}

const updateStatus = async (id, updateBody) => {
    const branch = await getBranchById(id);
    if (!branch) {
        throw new ApiError(httpStatus.NOT_FOUND, 'branch not found');
    }
    Object.assign(branch, updateBody);
    await branch.save();
    return branch;
};

const getAllBranch = async () => {
    const branches = await Branch.find();
    return branches;
}


module.exports = {
    createBranch,
    queryBranches,
    getBranchById,
    updateBranchById,
    deleteBranchById,
    updateStatus,
    getAllBranch,
}