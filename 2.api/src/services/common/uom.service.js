const httpStatus = require('http-status');
const UomModel = require('../../models/common/uom.model');
const ApiError = require('../../utils/ApiError');
const { Uom } = require('../../models');

const createUom = async (data) => {
    const uom = await UomModel.create(data);
    return uom;
}
const getUomById = async (id) => {
    const uom = await UomModel.findById(id);
    return uom;
}
const updateById = async (id, taxGroup) => {
    const a = await UomModel.findByIdAndUpdate(id, taxGroup)
    return a;
}
const deleteId = async (id) => {
    const taxGroup = await getUomById(id);
    if (!taxGroup) {
        throw new ApiError(httpStatus.NOT_FOUND, 'taxGroup not found');
    }
    await taxGroup.remove();
    return taxGroup;
}
const getAllUom = async () => {
    const categorys = await UomModel.find();
    return categorys;
};

const queryUoms = async (filter, options) => {
    const uoms = await Uom.paginate(filter, options);
    return uoms;
}

module.exports = {
    getAllUom,
    getUomById,
    createUom,
    updateById,
    deleteId,
    queryUoms,
};
