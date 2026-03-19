const httpStatus = require('http-status');
const { Customer } = require('../../models');
const ApiError = require('../../utils/ApiError');

const createCustomer = async (customer) => Customer.create(customer);
const queryCustomers = async (filter, options) => {
    const { searchText, ...otherFilters } = filter;
    let finalFilter = { ...otherFilters };
    if (searchText) {
        const searchRegex = new RegExp(searchText, 'i');
        finalFilter.$or = [
            { customerName: searchRegex },
            { contactNumber: searchRegex },
            { contactEmail: searchRegex },
            { addressTwo: searchRegex },
        ];
    }
    return Customer.paginate
        ? Customer.paginate(finalFilter, options)
        : Customer.find(finalFilter);
}
const getCustomerById = async (id) => Customer.findById(id);
const updateCustomerById = async (id, updateBody) => {
    const customer = await getCustomerById(id);
    if (!customer) throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    Object.assign(customer, updateBody);
    await customer.save();
    return customer;
};
const updateStatus = async (id, updateBody) => {
    const group = await getCustomerById(id);
    if (!group) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    }
    Object.assign(group, updateBody);
    await group.save();
    return group;
};
const deleteCustomerById = async (id) => {
    const customer = await getCustomerById(id);
    if (!customer) throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    await customer.remove();
    return customer;
};

const getAllCustomers = async () => {
    const customers = await Customer.find();
    return customers.map((c) => {
        const obj = c.toObject();
        obj.id = obj._id.toString();
        return obj;
    });
};

const insertManyCustomer = async (data) => {
    const customer = await Customer.insertMany(data, { ordered: false });
    return customer;
}

module.exports = {
    createCustomer,
    queryCustomers,
    getCustomerById,
    updateCustomerById,
    deleteCustomerById,
    getAllCustomers,
    updateStatus,
    insertManyCustomer
};
