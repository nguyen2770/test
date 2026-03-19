const { Types } = require('mongoose');
const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const catchAsync = require('../../utils/catchAsync');
const {
    breakdownSpareRequestService,
    breakdownAssignUserService,
    sequenceService,
    breakdownService,
    approvalTaskService,
} = require('../../services');
const notificationService = require('../../services/notification/notification.service');
const { notificationTypeCode } = require('../../utils/constant');
const { listenerCount } = require('../../models/authentication/token.model');

const createBreakdownSpareRequests = catchAsync(async (req, res) => {
    req.body = {
        ...req.body,
        spareRequest: {
            ...req.body.spareRequest,
            code: await sequenceService.generateSequenceCode('BREAKDOWN_SPARE_REQUEST'),
            createdBy: req.user.id,
            updatedBy: req.user.id,
        },
    };

    let breakdownSpareRequest;
    let breakdownSpareRequestDetail;

    const lastApprovedDoc = await breakdownSpareRequestService.getLastDocStatusApproved(req.body.spareRequest?.breakdown);

    if (lastApprovedDoc) {
        breakdownSpareRequest = lastApprovedDoc;
        breakdownSpareRequestDetail = await breakdownSpareRequestService.appendSpareRequestDetails(
            lastApprovedDoc._id,
            req.body.spareRequestDetail
        );
    } else {
        const result =
            await breakdownSpareRequestService.createBreakdownSpareRequest(req.body);

        breakdownSpareRequest = result.breakdownSpareRequest;
        breakdownSpareRequestDetail = result.breakdownSpareRequestDetail;
    }

    const notificationContent = {
        notificationTypeCode: notificationTypeCode.spare_part_request_breakdown,
        text: `Yêu cầu phụ tùng thay thế : ${breakdownSpareRequest.code}`,
        subUrl: `spare-part-request-breakdown-detail/${breakdownSpareRequest._id}`,
        notificationName: 'Yêu cầu phụ tùng sự cố',
    };

    await notificationService.pushNotification(notificationContent);

    res.status(httpStatus.CREATED).send({
        code: 1,
        data: {
            breakdownSpareRequest,
            breakdownSpareRequestDetail,
        },
    });
});

function toStartOfDay(dateStr) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
}

function toEndOfDay(dateStr) {
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    return d;
}

const queryBreakdownSpareRequests = catchAsync(async (req, res) => {
    let filter = pick(req.query, ['breakdownCode', 'status', 'startDate', 'endDate', 'code']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);

    if (filter.startDate) filter.startDate = toStartOfDay(filter.startDate);
    if (filter.endDate) filter.endDate = toEndOfDay(filter.endDate);
    const result = await breakdownSpareRequestService.queryBreakdownSpareRequests(filter, options);
    res.send({ results: result });
});

const deleteBreakdownSpareRequest = catchAsync(async (req, res) => {
    await breakdownSpareRequestService.deleteBreakdownSpareRequest(req.query.id);
    res.status(httpStatus.OK).send({ code: 1 });
});

const findBreakdownSpareRequestById = catchAsync(async (req, res) => {
    const breakdownSpareRequest = await breakdownSpareRequestService.findBreakdownSpareRequestById(req.query.id);
    res.status(httpStatus.OK).send({ code: 1, data: breakdownSpareRequest });
});
const updateBreakdownSpareRequestDetail = catchAsync(async (req, res) => {
    const updated = await breakdownSpareRequestService.updateBreakdownSpareRequestDetail(req.params.id, req.body);
    res.send({ code: 1, data: updated });
});

const queryBreakdownSpareRequestByBreakdown = catchAsync(async (req, res) => {
    let filter = pick(req.query, ['breakdown', 'status', 'startDate', 'endDate', 'code']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);
    const breakdownSpareRequest = await breakdownSpareRequestService.queryBreakdownSpareRequestByBreakdown(filter, options);
    res.send({ code: 1, data: breakdownSpareRequest });
});

const getAllBreakdownSpareRequestBySpareRequestId = catchAsync(async (req, res) => {
    const breakdownSpareRequest = await breakdownSpareRequestService.getAllBreakdownSpareRequestBySpareRequestId(
        req.query.id
    );
    res.send({ code: 1, data: breakdownSpareRequest });
});

const updateData = catchAsync(async (req, res) => {
    const { id, ...updateData1 } = req.body.breakdownSpareRequest;
    // updateData.updatedBy = req.user.id; // Nếu cần
    const updated = await breakdownSpareRequestService.updateData(id, updateData1);
    res.send({ code: 1, data: updated });
});
const assignUserFromSpareRequest = catchAsync(async (req, res) => {
    const { breakdownSpareRequestId, userIds, comment } = req.body;
    const spareRequest = await breakdownAssignUserService.assignUserFromSpareRequest(
        breakdownSpareRequestId,
        comment,
        userIds.map((_u) => Types.ObjectId(_u))
    );
    res.send({ code: 1, data: spareRequest });
});
const getBreakdownSparePartResByRes = catchAsync(async (req, res) => {
    const list = await breakdownSpareRequestService.getBreakdownSparePartResByRes({
        breakdown: req.query.breakdown,
    });

    // Lồng thêm assignUser cho từng item
    const finalResult = await Promise.all(
        list.map(async (item) => {
            const assignUsers = await breakdownSpareRequestService.breakdownSpareRequestAssignUserBybreakdownSpareRequest({
                breakdownSpareRequest: item._id || item.id,
            });
            return {
                ...(item.toObject?.() || item), // Nếu là mongoose document
                assignUsers,
            };
        })
    );

    res.send({ code: 1, data: finalResult });
});

const approveBreakdownSpareRequest = catchAsync(async (req, res) => {
    const breakdownSpareRequest = await breakdownSpareRequestService.approveBreakdownSpareRequest({
        breakdownSpareRequestId: req.params.breakdownSpareRequestId,
        breakdownSpareRequestDetails: req.body.breakdownSpareRequestDetails,
        userId: req.body.user,
    });
    if (breakdownSpareRequest?.breakdown) {
        const breakdown = await breakdownService.getBreakdownByIdNoPopulate(breakdownSpareRequest?.breakdown);
        console.log(req.body.userIds);
        if (req.body.userIds && req.body.userIds.length > 0) {
            console.log(req.body.userIds);
            const notificationContent = {
                notificationTypeCode: notificationTypeCode.spare_parts_have_been_shipped,
                text: `Phụ tùng đã được gửi đến, sự cố : ${breakdown.code}`,
                subUrl: `view-my-breakdown/${breakdown._id}`,
                notificationName: 'Phụ tùng đã gửi',
                users: req.body.userIds,
            };
            await notificationService.pushNotificationWithUsers(notificationContent);
        } else {
            console.log(req.body.user);
            const notificationContent = {
                notificationTypeCode: notificationTypeCode.spare_parts_have_been_shipped,
                text: `Phụ tùng đã được gửi đến, sự cố : ${breakdown.code}`,
                subUrl: `view-my-breakdown/${breakdown._id}`,
                notificationName: 'Phụ tùng đã gửi',
                user: req.body.user,
            };
            await notificationService.pushNotificationWithUser(notificationContent);
        }
        if (breakdownSpareRequest) {
            const payload = {
                processedAt: new Date(),
                processedBy: req.user.id,
                status: "PROCESSED"
            }
            await approvalTaskService.updateApprovalTaskBySourceId(req.params.breakdownSpareRequestId, payload);
        }
    }
    res.send({ code: 1, data: breakdownSpareRequest });
});

const updateBreakdownSpareRequest = catchAsync(async (req, res) => {
    req.body = {
        ...req.body,
        spareRequest: {
            ...req.body.spareRequest,
            updatedBy: req.user.id,
        },
    };
    console.log(req.body);

    const breakdownSpareRequest = await breakdownSpareRequestService.updateBreakdownSpareRequest(req.body);
    res.send({ code: 1, data: breakdownSpareRequest });
});

module.exports = {
    createBreakdownSpareRequests,
    queryBreakdownSpareRequests,
    deleteBreakdownSpareRequest,
    updateBreakdownSpareRequest,
    updateBreakdownSpareRequestDetail,
    findBreakdownSpareRequestById,
    queryBreakdownSpareRequestByBreakdown,
    getAllBreakdownSpareRequestBySpareRequestId,
    updateData,
    assignUserFromSpareRequest,
    getBreakdownSparePartResByRes,
    approveBreakdownSpareRequest,
};
