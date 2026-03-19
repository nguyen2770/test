const httpStatus = require('http-status');
const { Supplier } = require('../../models');
const ApiError = require('../../utils/ApiError');


const createSupplier = async (data) => {
    return Supplier.create(data);
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
const querySuppliers = async (filter, options) => {
    const { searchText, ...otherFilters } = filter;
    let finalFilter = { ...otherFilters };
    if (searchText) {
        const searchRegex = new RegExp(searchText, 'i');
        finalFilter.$or = [
            { supplierName: searchRegex },
            { phoneNumber: searchRegex },
            { email: searchRegex },
            { address: searchRegex },
        ];
    }
    const suppliers = await Supplier.paginate(finalFilter, options);
    return suppliers;
};

const getSupplierById = async (id) => {
    return Supplier.findById(id);
};

const updateSupplierById = async (supplierId, updateBody) => {
    const supplier = await getSupplierById(supplierId);
    if (!supplier) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');
    }

    Object.assign(supplier, updateBody);
    await supplier.save();
    return supplier;
};

const deleteSupplierById = async (supplierId) => {
    const supplier = await getSupplierById(supplierId);
    if (!supplier) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');
    }
    await supplier.remove();
    return supplier;
};

const updateStatus = async (id, updateBody) => {
    const supplier = await getSupplierById(id);
    if (!supplier) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');
    }
    Object.assign(supplier, updateBody);
    await supplier.save();
    return supplier;
};

const getAllSupplier = async () => {
    const suppliers = await Supplier.find();
    return suppliers;
};
module.exports = {
    querySuppliers,
    getSupplierById,
    updateSupplierById,
    deleteSupplierById,
    createSupplier,
    updateStatus,
    getAllSupplier,
};
