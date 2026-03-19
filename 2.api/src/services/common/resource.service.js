const { Resource } = require('../../models');

const createResource = async (resource) => {
    return Resource.create(resource);
};
const deleteResourceById = async (id) => {
    return Resource.findByIdAndDelete(id);
};
const getResourceById = async (id) => {
    return Resource.findById(id);
};

module.exports = {
    createResource,
    deleteResourceById,
    getResourceById,
};
