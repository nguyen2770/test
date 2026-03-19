const { ApprovalTaskModel } = require("../../models")


const queryApprovalTask = async (filter, options) => {
    const res = await ApprovalTaskModel.paginate(filter, options);
    return res;
};

const createApprovalTask = async (payload) => {
    const res = await ApprovalTaskModel.create(payload);
    return res;
};

const updateApprovalTask = async (id, payload) => {
    const res = await ApprovalTaskModel.findByIdAndUpdate(id, payload);
    return res;
};


const updateApprovalTaskBySourceId = async (id, payload) => {
    const res = await ApprovalTaskModel.findOneAndUpdate(
        { sourceId: id },
        { $set: payload },
        { new: true }
    );

    return res;
};
module.exports = {
    queryApprovalTask,
    createApprovalTask,
    updateApprovalTask,
    updateApprovalTaskBySourceId,
};