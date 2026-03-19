const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const catchAsync = require('../../utils/catchAsync');
const {
    schedulePreventiveService,
    preventiveService,
    sequenceService,
    schedulePrevetiveTaskSparePartRequestService,
    approvalTaskService,
} = require('../../services');
const ApiError = require('../../utils/ApiError');
const {
    schedulePreventiveTaskAssignUserStatus,
    ticketSchedulePreventiveStatus,
    schedulePreventiveStatus,
    spareRequestType,
    schedulePreventiveTaskRequestSparePartDetailStatus,
    approvedTaskType,
    notificationTypeCode,
} = require('../../utils/constant');
const { SparePartDetail } = require('../../models');
const notificationService = require('../../services/notification/notification.service');
/**
 * Create a user
 * @type {(function(*, *, *): void)|*}
 */
const createSchedulePreventiveSparePartRequest = catchAsync(async (req, res) => {
    const { schedulePreventive, schedulePreventiveTask, schedulePreventiveRequestSpareParts, assetMaintenance } =
        req.body.data;
    const payload = {
        schedulePreventive,
        schedulePreventiveTask,
        createdBy: req.user.id,
        userName: req.user.fullName,
        code: await sequenceService.generateSequenceCode('SPARE_PART_REQUEST'),
    };
    const countSchedulePreventiveTaskRequestSparePart =
        await schedulePrevetiveTaskSparePartRequestService.countSchedulePreventiveTaskRequestSparePartBySchedulePreventiveTaskId(
            schedulePreventiveTask
        );
    // nếu mà có rồi thì sẽ không thêm mới nữa chỉ thêm mới các detail
    const schedulePrevetiveSparePartRequest =
        countSchedulePreventiveTaskRequestSparePart > 0
            ? await schedulePrevetiveTaskSparePartRequestService.getSchedulePreventiveTaskRequestSparePartLatest(
                schedulePreventiveTask
            )
            : await schedulePrevetiveTaskSparePartRequestService.createschedulePrevetiveSparePartRequest(payload);
    for (const item of schedulePreventiveRequestSpareParts) {
        const detailPayload = {
            sparePart: item.sparePart,
            schedulePrevetiveTaskSparePartRequest: schedulePrevetiveSparePartRequest._id,
            spareRequestType: item.spareRequestType,
            qty: item.qty,
            unitCost: item.unitCost,
            createdBy: req.user.id,
        };
        if (item.spareRequestType === spareRequestType.spareReplace) {
            detailPayload.requestStatus = schedulePreventiveTaskRequestSparePartDetailStatus.spareReplace;
        }
        await schedulePrevetiveTaskSparePartRequestService.createSchedulePrevetiveSparePartRequestDetail(detailPayload);
        await schedulePrevetiveTaskSparePartRequestService.changeState(
            schedulePreventive,
            schedulePreventiveTask,
            req.user.id,
            schedulePrevetiveSparePartRequest._id
        );
    }
    // updete data sparePartDetail nếu phiếu gửi có kiểu là spareReplace và có sparePartDetail
    const spareReplaceDetails = schedulePreventiveRequestSpareParts.filter(
        (item) => item.spareRequestType === 'spareReplace' && item.sparePartDetail
    );

    if (spareReplaceDetails.length > 0) {
        await SparePartDetail.updateMany(
            {
                qrCode: { $in: spareReplaceDetails.map((x) => x.sparePartDetail) },
            },
            {
                $set: {
                    replacementDate: new Date(),
                    updatedBy: req.user.id,
                    assetMaintenance: assetMaintenance,
                },
            }
        );
    }
    // tạo thông báo
    const notificationContent = {
        notificationTypeCode: notificationTypeCode.request_for_spare_parts_for_maintenance,
        text: `Yêu cầu phụ tùng bảo trì : ${schedulePrevetiveSparePartRequest.code}`,
        subUrl: `spare-part-request-schedule-preventive-detail/${schedulePrevetiveSparePartRequest._id}`,
        notificationName: 'Yêu cầu phụ tùng bảo trì',
    };
    await notificationService.pushNotification(notificationContent);
    res.status(httpStatus.CREATED).send({ code: 1 });
});
const querySchedulePrevetiveTaskSparePartRequests = catchAsync(async (req, res) => {
    const filter = pick(req.body, [
        'schedulePreventive',
        'schedulePreventiveTask',
        'code',
        'status',
        'assignUserDate',
        'endDate',
        'startDate',
        'sparePartCode',
    ]);
    const options = pick(req.body, ['sortBy', 'limit', 'page', 'sortOrder']);
    const results = await schedulePrevetiveTaskSparePartRequestService.querySchedulePrevetiveTaskSparePartRequests(
        filter,
        options
    );
    const data = await Promise.all(
        results?.results.map(async (item) => {
            const schedulePrevetiveTaskSparePartRequest = item.toObject();
            schedulePrevetiveTaskSparePartRequest.schedulePrevetiveTaskSparePartRequestDetails =
                await schedulePrevetiveTaskSparePartRequestService.getSchedulePrevetiveTaskRequestSparePartRequestDetailByRes(
                    {
                        schedulePrevetiveTaskSparePartRequest: item._id,
                    }
                );
            return schedulePrevetiveTaskSparePartRequest;
        })
    );
    res.status(httpStatus.OK).send({
        code: 1,
        data,
        totalResults: results.totalResults,
        limit: results.limit,
        page: results.page,
        totalPages: results.totalPages,
    });
});
const comfirmSendSparePart = catchAsync(async (req, res) => {
    const { user, schedulePrevetiveTaskSparePartRequest, schedulePrevetiveTaskSparePartRequestDetails } = req.body;
    const schedulePreventiveTaskAssignUser = await schedulePrevetiveTaskSparePartRequestService.comfirmSendSparePart(
        user,
        schedulePrevetiveTaskSparePartRequest,
        schedulePrevetiveTaskSparePartRequestDetails
    );
    if (schedulePreventiveTaskAssignUser && schedulePreventiveTaskAssignUser?.schedulePreventive) {
        // tạo thông báo
        const schedulePreventive = await schedulePreventiveService.getSchedulePreventiveByIdNotPopulate(
            schedulePreventiveTaskAssignUser?.schedulePreventive
        );
        const notificationContent = {
            notificationTypeCode: notificationTypeCode.maintenance_approval_has_been_submitted,
            text: `Phụ tùng đã được gửi đi, công việc bảo trì : ${schedulePreventive.code}`,
            subUrl: `cong-viec/chi-tiet/${schedulePreventiveTaskAssignUser._id}`,
            notificationName: 'Đã gửi phụ tùng yêu cầu của bảo trì',
            user: user,
        };
        await notificationService.pushNotificationWithUser(notificationContent);

        //
        const payload = {
            processedAt: new Date(),
            processedBy: req.user.id,
            status: "PROCESSED"
        }
        await approvalTaskService.updateApprovalTaskBySourceId(schedulePrevetiveTaskSparePartRequest, payload);

    }
    res.send({ code: 1, data: schedulePreventiveTaskAssignUser });
});
const getScheduleePreventiveRequestSparePartById = catchAsync(async (req, res) => {
    const { id } = req.body;
    const schedulePreventiveServiceConfirm =
        await schedulePrevetiveTaskSparePartRequestService.getScheduleePreventiveRequestSparePartById(id);
    res.send({ code: 1, data: schedulePreventiveServiceConfirm });
});

module.exports = {
    createSchedulePreventiveSparePartRequest,
    querySchedulePrevetiveTaskSparePartRequests,
    comfirmSendSparePart,
    getScheduleePreventiveRequestSparePartById,
};
