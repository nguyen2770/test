const httpStatus = require('http-status');
const { SparePart, SparePartDetail } = require('../../models');
const ApiError = require('../../utils/ApiError');

const createSparePart = async (sparePart) => {
    const createdSparePart = await SparePart.create(sparePart);
    return createdSparePart;
};

const querySpareParts = async (filter, options) => {
    const spareParts = await SparePart.paginate(filter, {
        ...options,
        populate: [
            { path: 'spareCategoryId', select: 'spareCategoryName' },
            { path: 'spareSubCategoryId', select: 'spareSubCategoryName' },
            { path: 'manufacturer', select: 'manufacturerName' },
            { path: 'uomId', select: 'uomName' },
        ],
    });
    return spareParts;
};

const getSparePartById = async (id) => {
    const sparePart = await SparePart.findById(id)
        .populate({ path: 'spareCategoryId', select: 'spareCategoryName' })
        .populate({ path: 'spareSubCategoryId', select: 'spareSubCategoryName' })
        .populate({ path: 'manufacturer', select: 'manufacturerName' })
        .populate({ path: 'uomId', select: 'uomName' });
    return sparePart;
};

const updateSparePartById = async (id, sparePartData) => {
    const updatedSparePart = await SparePart.findByIdAndUpdate(id, sparePartData, { new: true });
    return updatedSparePart;
};

const deleteSparePartById = async (id) => {
    const sparePart = await getSparePartById(id);
    if (!sparePart) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Spare part not found');
    }
    await sparePart.remove();
    return sparePart;
};

const getAllSpareParts = async () => {
    const spareParts = await SparePart.find().populate({ path: 'manufacturer' });
    return spareParts;
};

const updateSparePartStatus = async (id, status) => {
    const sparePart = await SparePart.findById(id);
    if (!sparePart) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Spare part not found');
    }
    sparePart.status = status;
    await sparePart.save();
    return sparePart;
};

const querySparePartDetails = async (filter, options) => {
    const sparePartDetails = await SparePartDetail.paginate(filter, {
        ...options,
        populate: [
            {
                path: "sparePart",
            },
        ],
    });

    return sparePartDetails;
};


const getSparePartDetailByQrCode = async (qrCode) => {
    const sparePartDetail = await SparePartDetail.findOne({ qrCode: qrCode })
        .populate({ path: "sparePart" })
        .populate({ path: "manufacturer" })
        .populate({ path: "supplier" })
        .populate({ path: "assetMaintenance" })

    return sparePartDetail;
}

const updateSparePartDetailByQrCode = async (qrCode, updateData) => {
    const updatedSparePartDetail = await SparePartDetail.findOneAndUpdate({ qrCode: qrCode }, updateData, { new: true });
    return updatedSparePartDetail;
}
const getSparePartByIdNotPopulate = async (id) => {
    const sparePart = await SparePart.findById(id);
    return sparePart;
};

module.exports = {
    createSparePart,
    querySpareParts,
    getSparePartById,
    updateSparePartById,
    deleteSparePartById,
    getAllSpareParts,
    updateSparePartStatus,
    querySparePartDetails,
    getSparePartDetailByQrCode,
    updateSparePartDetailByQrCode,
    getSparePartByIdNotPopulate,
};
