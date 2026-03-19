const httpStatus = require('http-status');
const { Building } = require('../../models');
const ApiError = require('../../utils/ApiError');


const createBuilding = async (building) => {
    const a = await Building.create(building)
    return a;
} 

const queryBuildings = async (filter, options) => {
    const a = await Building.paginate(filter, options);
    return a;
} 

const getBuildingById = async (id) => {
    const a = await Building.findById(id)
    return a;
} 
const updateBuildingById = async (id, building) => {
    
    const a = await Building.findByIdAndUpdate(id,building)
    return a;
} 
const deleteBuildingById = async (id) => {
    const building = await getBuildingById(id);
    if (!building) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Building not found');
    }
    await building.remove();
    return building; 
} 

const updateStatus = async (id, updateBody) => {
    const building = await getBuildingById(id);
    if (!building) {
        throw new ApiError(httpStatus.NOT_FOUND, 'building not found');
    }
    Object.assign(building, updateBody);
    await building.save();
    return building;
};

const getAllBuilding = async () => {
    const buildings = await Building.find();
    return buildings;
}

module.exports = {
    createBuilding,
    queryBuildings,
    getBuildingById,
    updateBuildingById,
    deleteBuildingById,
    updateStatus,
    getAllBuilding,
}