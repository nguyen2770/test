const httpStatus = require('http-status');
const { Types } = require('mongoose');
const { ServiceContractorModel, ServiceContractorUserMappingModel, User } = require('../../models');
const ApiError = require('../../utils/ApiError');


const createServiceContractor = async (_serviceContractor) => {
    return ServiceContractorModel.create(_serviceContractor);
};


const queryServiceContractors = async (filter, options) => {
    const { searchText, ...otherFilters } = filter;
    let finalFilter = { ...otherFilters };
    if (searchText) {
        const searchRegex = new RegExp(searchText, 'i');
        finalFilter.$or = [
            { serviceContractorName: searchRegex },
            { contactPerson: searchRegex },
            { contactEmail: searchRegex },
            { contactPhoneNumber: searchRegex },
        ];
    }
    const serviceContractorCategories = await ServiceContractorModel.paginate(finalFilter, options);
    return serviceContractorCategories;
};

const getServiceContractorById = async (id) => {
    return ServiceContractorModel.findById(id);
};


const updateServiceContractorById = async (_id, updateBody) => {
    const serviceContractor = await getServiceContractorById(_id);
    if (!serviceContractor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'serviceContractor not found');
    }

    Object.assign(serviceContractor, updateBody);
    await serviceContractor.save();
    return serviceContractor;
};
const deleteServiceContractorById = async (id) => {
    const serviceContractor = await getServiceContractorById(id);
    if (!serviceContractor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'serviceContractor not found');
    }
    await serviceContractor.remove();
    return serviceContractor;
};


const getAllServiceContractors = async () => {
    return ServiceContractorModel.find();
};
const createServiceContractorUserMapping = async (_serviceContractorUserMapping) => {
    return ServiceContractorUserMappingModel.create(_serviceContractorUserMapping);
};
const updateServiceContractorUserMappingById = async (_id, updateBody) => {
    const serviceContractorUserMapping = await ServiceContractorUserMappingModel.findById(_id);
    if (!serviceContractorUserMapping) {
        throw new ApiError(httpStatus.NOT_FOUND, 'serviceContractor not found');
    }

    Object.assign(serviceContractorUserMapping, updateBody);
    await serviceContractorUserMapping.save();
    return serviceContractorUserMapping;
};
const deleteServiceContractorUserMappingById = async (id) => {
    const serviceContractorUserMapping = await ServiceContractorUserMappingModel.findById(id);
    if (!serviceContractorUserMapping) {
        throw new ApiError(httpStatus.NOT_FOUND, 'serviceContractorUserMapping not found');
    }
    await serviceContractorUserMapping.remove();
    return serviceContractorUserMapping;
};
const getServiceContractorUserMappingByRes = async (data) => {
    return ServiceContractorUserMappingModel.find(data).populate([{
        path: 'user'
    },
    {
        path: 'serviceContractor'
    }]);
};
const getListUserNotInServiceContractUserMapping = async (filter, options) => {
    // Nếu có truyền vào serviceContractor, lọc user chưa được ánh xạ
    if (filter.serviceContractor) {
        const serviceContractorUserMappings = await ServiceContractorUserMappingModel.find({
            serviceContractor: { $in: Array.isArray(filter.serviceContractor) ? filter.serviceContractor : [filter.serviceContractor] }
        }).select('user');
        const mappedUserIds = serviceContractorUserMappings.map(mapping => Types.ObjectId(mapping.user));
        // Thêm điều kiện loại trừ những user đã ánh xạ
        filter._id = { $nin: mappedUserIds };
        // Xoá key `serviceContractor` ra khỏi filter vì User không có field này
        delete filter.serviceContractor;
    }
    // Tìm những user KHÔNG nằm trong danh sách mappedUserIds
    const users = await User.paginate(filter, options);
    return users;
};


module.exports = {
    queryServiceContractors,
    createServiceContractor,
    updateServiceContractorById,
    getServiceContractorById,
    deleteServiceContractorById,
    getAllServiceContractors,
    createServiceContractorUserMapping,
    updateServiceContractorUserMappingById,
    deleteServiceContractorUserMappingById,
    getServiceContractorUserMappingByRes,
    getListUserNotInServiceContractUserMapping,
};
