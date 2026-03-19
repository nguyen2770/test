const httpStatus = require('http-status');
const { Floor } = require('../../models');
const ApiError = require('../../utils/ApiError');


const createFloor = async (floor) => {
    const a = await Floor.create(floor)
    return a;
} 

const queryFloors = async (filter, options) => {
    const a = await Floor.paginate(filter, options);
    return a;
} 

const getFloorById = async (id) => {
    const a = await Floor.findById(id)
    return a;
} 
const updateFloorById = async (id, floor) => {
    const a = await Floor.findByIdAndUpdate(id,floor)
    return a;
} 
const deleteFloorById = async (id) => {
    const floor = await getFloorById(id);
    if (!floor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Floor not found');
    }
    await floor.remove();
    return floor; 
} 

const updateStatus = async (id, updateBody) => {
    const floor = await getFloorById(id);
    if (!floor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'floor not found');
    }
    Object.assign(floor, updateBody);
    await floor.save();
    return floor;
};

const getAllFloor = async () => {
    const floors = await Floor.find();
    return floors;
}

module.exports = {
    createFloor,
    queryFloors,
    getFloorById,
    updateFloorById,
    deleteFloorById,
    updateStatus,
    getAllFloor
}