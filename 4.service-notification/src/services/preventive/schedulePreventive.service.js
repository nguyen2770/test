const {
  CalibrationWorkModel,
  SchedulePreventiveTaskAssignUserModel,
} = require("../../models");
const {
  calibrationGroupStatus,
  notificationTypeCode,
  ticketSchedulePreventiveStatus,
  schedulePreventiveTaskAssignUserStatus,
  schedulePreventiveStatus,
} = require("../../utils/constant");
const { SchedulePreventiveModel } = require("../../models");
const notificationTypeModel = require("../../models/notification/notificationType.model");
const notificationService = require("../notification/notification.service");
const overdueSchedulePrventive = async () => {
  const schedulePreventives = await SchedulePreventiveModel.find({
    ticketStatus: {
      $in: [
        ticketSchedulePreventiveStatus.inProgress,
        ticketSchedulePreventiveStatus.new,
      ],
    },
    $expr: {
      $lt: [
        {
          $add: [
            "$startDate",
            {
              $multiply: [{ $ifNull: ["$maintenanceDurationHr", 0] }, 3600000],
            },
            {
              $multiply: [{ $ifNull: ["$maintenanceDurationMin", 0] }, 60000],
            },
          ],
        },
        "$$NOW",
      ],
    },
  });
  for (const schedulePreventive of schedulePreventives) {
    const payloadNoti = {
      notificationTypeCode: notificationTypeCode.overdue_schedule_preventive,
      isNotifyTheManager: true,
      isPriorNoticeRequired: true,
      text: `Công việc bảo trì ${schedulePreventive.code} đã quá hạn. Vui lòng, liên hệ người được giao việc để hoàn thành`,
      subUrl: `bao-tri/chi-tiet/${schedulePreventive._id}`,
      webSubUrl: `maintenance/work-order-schedule-preventive/view/${schedulePreventive._id}`,
      notificationName: "Công việc bảo trì quá hạn",
    };

    await notificationService.pushNotification(payloadNoti);
    // thông báo đến người được giao việc
    const schedulePreventiveAssignUsers =
      await SchedulePreventiveTaskAssignUserModel.find({
        schedulePreventive: schedulePreventive?._id,
        status: {
          $in: [
            schedulePreventiveTaskAssignUserStatus.accepted,
            schedulePreventiveTaskAssignUserStatus.assigned,
            schedulePreventiveTaskAssignUserStatus.inProgress,
            schedulePreventiveTaskAssignUserStatus.submitted,
            schedulePreventiveTaskAssignUserStatus.approved,
            schedulePreventiveTaskAssignUserStatus.pendingApproval, // các trạng thái đang còn làm việc
          ],
        },
      });

    if (
      schedulePreventiveAssignUsers &&
      schedulePreventiveAssignUsers.length > 0
    ) {
      for (const schedulePreventiveAssignUser of schedulePreventiveAssignUsers) {
        const payloadNoti = {
          notificationTypeCode:
            notificationTypeCode.overdue_schedule_preventive,
          text: `Công việc bảo trì ${schedulePreventive.code} của bạn đã quá hạn làm việc. Vui lòng truy cập để thực hiện công việc`,
          subUrl: `cong-viec/chi-tiet/${schedulePreventiveAssignUser._id}`,
          webSubUrl: `maintenance/work-order-schedule-preventive/view/${schedulePreventive._id}`,
          notificationName: "Công việc bảo trì quá hạn",
          user: schedulePreventiveAssignUser?.user,
        };
        await notificationService.pushNotificationWithUser(payloadNoti);
      }
    }
  }
  return schedulePreventives;
};
const schedlePtreventiveDeadlineIsApproaching = async (
  schedlePtreventiveWorkOverdueIds
) => {
  const now = new Date();
  const notificationType = await notificationTypeModel.findOneAndUpdate(
    { code: notificationTypeCode.schedule_preventive_deadline_is_approaching },
    {
      $setOnInsert: {
        code: notificationTypeCode.schedule_preventive_deadline_is_approaching,
        name: "Sắp đến hạn công việc bảo trì",
        isNotifyTheManager: true,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
  const advanceNoticeDays = notificationType?.advanceNoticeDays ?? 0;
  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };
  const startNotifyDate = new Date();
  startNotifyDate.setDate(startNotifyDate.getDate() + advanceNoticeDays);

  const endDateTo = endOfDay(startNotifyDate);
  const startDateFrom = startOfDay(now);

  const schedulePreventives = await SchedulePreventiveModel.find({
    _id: { $nin: schedlePtreventiveWorkOverdueIds },
    ticketStatus: schedulePreventiveStatus.new,
    startDate: {
      $gte: startDateFrom,
      $lte: endDateTo,
    },
  });
  console.log(startDateFrom, endDateTo);
  for (const schedulePreventive of schedulePreventives) {
    // thông báo người quản lý
    const payloadNoti = {
      notificationTypeCode:
        notificationTypeCode.schedule_preventive_deadline_is_approaching,
      isNotifyTheManager: true,
      text: `Công việc bảo trì ${schedulePreventive.code} sắp đến thời gian làm việc. Ngày làm việc là ${schedulePreventive?.startDate}`,
      webSubUrl: `maintenance/work-order-schedule-preventive/view/${schedulePreventive._id}`,
      subUrl: `bao-tri/chi-tiet/${schedulePreventive._id}`,
      notificationName: "Sắp đến hạn công việc bảo trì",
    };
    await notificationService.pushNotification(payloadNoti);
    // thông báo đến người được giao việc
    const schedulePreventiveTaskAssignUsers =
      await SchedulePreventiveTaskAssignUserModel.find({
        schedulePreventive: schedulePreventive?._id,
        status: {
          $in: [
            schedulePreventiveTaskAssignUserStatus.assigned,
            schedulePreventiveTaskAssignUserStatus.accepted,
          ],
        },
      });
    if (
      schedulePreventiveTaskAssignUsers &&
      schedulePreventiveTaskAssignUsers.length > 0
    ) {
      for (const schedulePreventiveTaskAssignUser of schedulePreventiveTaskAssignUsers) {
        const payloadNoti = {
          notificationTypeCode:
            notificationTypeCode.schedule_preventive_deadline_is_approaching,
          text: `Công việc bảo trì ${schedulePreventive.code} của bạn đã sắp tới ngày làm việc. Ngày làm việc là ${schedulePreventive?.startDate}`,
          subUrl: `cong-viec/chi-tiet/${schedulePreventiveTaskAssignUser._id}`,
          webSubUrl: `maintenance/work-order-schedule-preventive/view/${schedulePreventive._id}`,
          notificationName: "Sắp đến hạn công việc bảo trì",
          user: schedulePreventiveTaskAssignUser?.user,
        };
        await notificationService.pushNotificationWithUser(payloadNoti);
      }
    }
  }
};

const prevetiveNotification = async () => {
  const calibrationWorkOverdues = await overdueSchedulePrventive();
  const calibrationWorkOverdueIds = calibrationWorkOverdues.map(
    (data) => data._id
  );
  // nếu mà thông báo quá hạn rồi thì thôi thông báo đến hạn công việc
  await schedlePtreventiveDeadlineIsApproaching(calibrationWorkOverdueIds);
};

module.exports = {
  prevetiveNotification,
};
