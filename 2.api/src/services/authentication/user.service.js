const httpStatus = require('http-status');
const { User, RolePermissionModel } = require('../../models');
const ApiError = require('../../utils/ApiError');
const UserBranchModel = require('../../models/users/userBranch.model');
const CompanySettingModel = require('../../models/common/companySetting.model');
const DeviceMobileModel = require('../../models/authentication/deviceMobile.model');
/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
    if (await User.isUsernameTaken(userBody.username)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
    }
    return User.create(userBody);
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
const queryUsers = async (filter, options) => {
    const { searchText, ...otherFilters } = filter;
    let finalFilter = { ...otherFilters };
    if (searchText) {
        const searchRegex = new RegExp(searchText, 'i');
        finalFilter.$or = [
            { fullName: searchRegex },
            { contactNo: searchRegex },
            { email: searchRegex },
        ];
    }
    const users = await User.paginate(finalFilter, {
        ...options,
        populate: [
            { path: 'role', select: 'name' },
            { path: 'branch', select: 'name' },
            { path: 'department', select: 'departmentName' },
        ],
    });

    return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
    return User.findById(id);
};

/**
 * Get user by email
 * @param {string} username
 * @returns {Promise<User>}
 */
const getUserByUsername = async (username) => {
    return User.findOne({ username });
};
const getUserByEmail = async (_email) => {
    return User.findOne({ email: _email });
};
const getUserByIdPopulate = async (id) => {
    return User.findById(id).populate([{ path: 'role' }, { path: 'branch' }, { path: 'department' }]);
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (updateBody.username && (await User.isUsernameTaken(updateBody.username, userId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
    }
    Object.assign(user, updateBody);
    await user.save();
    return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await user.remove();
    return user;
};

const updateStatus = async (id, updateBody) => {
    const user = await getUserById(id);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    Object.assign(user, updateBody);
    await user.save();
    return user;
};

const getAllUser = async () => {
    const Users = await User.find();
    return Users;
};
const updateUserBranchs = async (userId, _userBranchs) => {
    // xóa dữ liệu cũ
    await UserBranchModel.deleteMany({ user: userId });
    const userBranchs = await UserBranchModel.insertMany(_userBranchs);
    return userBranchs;
};
const getUserBranchs = async (userId) => {
    // xóa dữ liệu cũ
    const userBranchs = await UserBranchModel.find({ user: userId }).populate([{ path: 'branch' }]);
    return userBranchs;
};
const verifyApp = async (deviceToken, userId) => {
    console.log("deviceToken", deviceToken);
    console.log("userId", userId)
    const _deviceMobileFind = await DeviceMobileModel.findOne({
        deviceToken: deviceToken,
        user: userId
    });
    return _deviceMobileFind;
}
const logoutMobile = async (deviceToken, userId) => {
    await DeviceMobileModel.deleteMany(
        { deviceToken: deviceToken, user: userId },
    );
}
const saveDeviceMobile = async (deviceMobile) => {
    const _deviceMobileFind = await DeviceMobileModel.findOne({
        deviceToken: deviceMobile.deviceToken,
    });
    if (_deviceMobileFind) {
        await DeviceMobileModel.findOneAndUpdate(
            { deviceToken: deviceMobile.deviceToken }, // điều kiện tìm
            { $set: { ...deviceMobile } },
            { new: true } // ✅ trả về bản ghi sau khi update
        );
    } else {

        return await DeviceMobileModel.create(deviceMobile)
    }
    return _deviceMobileFind;
}
const getCompanySetting = async (companyId) => {
    // xóa dữ liệu cũ
    const companySetting = await CompanySettingModel.findOne({ company: companyId });
    return companySetting;
};
const getPermisisons = async (userId) => {
    // xóa dữ liệu cũ
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    const permissions = await RolePermissionModel.find({ user: user.role }).populate([{ path: 'permission' }]);
    return permissions;
};
const getPermissisonByUsers = async (userId) => {
    // xóa dữ liệu cũ
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    const rolePermissionModels = await RolePermissionModel.find({ role: user.role }).populate([{ path: 'permission' }]);
    const permissions = rolePermissionModels.map((rp) => rp.permission);
    return permissions;
};
const updateCompanySetting = async (company, _companySetting) => {
    const companySetting = await CompanySettingModel.findOne({ company: company.id });
    if (!companySetting) {
        const _companySetiingCreate = await CompanySettingModel.create({ ..._companySetting, company: company.id });
        return _companySetiingCreate;
    }
    Object.assign(companySetting, _companySetting);
    await companySetting.save();
    return companySetting;
};
module.exports = {
    createUser,
    queryUsers,
    getUserById,
    getUserByUsername,
    updateUserById,
    deleteUserById,
    updateStatus,
    getAllUser,
    updateUserBranchs,
    getUserBranchs,
    getPermisisons,
    updateCompanySetting,
    getCompanySetting,
    getPermissisonByUsers,
    getUserByIdPopulate,
    getUserByEmail,
    saveDeviceMobile,
    verifyApp,
    logoutMobile
};
