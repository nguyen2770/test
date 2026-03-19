const httpStatus = require('http-status');
const { Department } = require('../../models');
const ApiError = require('../../utils/ApiError');


const createDepartment = async (department) => {
    const a = await Department.create(department)
    return a;
} 

const queryDepartments = async (filter, options) => {
    const a = await Department.paginate(filter, options);
    return a;
} 

const getDepartmentById = async (id) => {
    const a = await Department.findById(id)
    return a;
} 
const updateDepartmentById = async (id, department) => {
    const a = await Department.findByIdAndUpdate(id,department)
    return a;
} 
const deleteDepartmentById = async (id) => {
    const department = await getDepartmentById(id);
    if (!department) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
    }
    await department.remove();
    return department; 
}

const updateStatus = async (id, updateBody) => {
    const department = await getDepartmentById(id);
    if (!department) {
        throw new ApiError(httpStatus.NOT_FOUND, 'department not found');
    }
    Object.assign(department, updateBody);
    await department.save();
    return department;
};

const getAllDepartment = async () => {
    const departments = await Department.find();
    return departments;
}


module.exports = {
    createDepartment,
    queryDepartments,
    getDepartmentById,
    updateDepartmentById,
    deleteDepartmentById,
    updateStatus,
    getAllDepartment,
}