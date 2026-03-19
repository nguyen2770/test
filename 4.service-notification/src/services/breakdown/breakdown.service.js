const { BreakdownModel, BreakdownAssignUserModel } = require("../../models");
const {
  notificationTypeCode,
  ticketBreakdownStatus,
  breakdownAssignUserStatus,
} = require("../../utils/constant");
const notificationService = require("../notification/notification.service");

const overdueBreakdown = async () => {
  const breakdowns = await BreakdownModel.aggregate([
    {
      $match: {
        ticketStatus: {
          $in: [ticketBreakdownStatus.new, ticketBreakdownStatus.inProgress],
        },
        incidentDeadline: {
          $lt: new Date(),
        },
      },
    },
  ]);
  const params = new URLSearchParams({ ticketStatus: "hasOpened" });
  for (const breakdown of breakdowns) {
    const payloadNoti = {
      notificationTypeCode: notificationTypeCode.overdue_breakdown,
      isNotifyTheManager: true,
      text: `Sự cố ${breakdown.code} đã quá hạn. Vui lòng, liên hệ người được giao việc để hoàn thành công việc`,
      subUrl: `view-my-breakdown/${breakdown._id}?${params.toString()}`,
      webSubUrl: `breakdown/work-order-breakdown/view/${breakdown._id}`,
      notificationName: "Sự cố quá hạn",
    };

    await notificationService.pushNotification(payloadNoti);
    // thông báo đến người được giao việc
    const breakdownAssignUsers = await BreakdownAssignUserModel.find({
      breakdown: breakdown?._id,
      status: {
        $in: [
          breakdownAssignUserStatus.accepted,
          breakdownAssignUserStatus.assigned,
          breakdownAssignUserStatus.inProgress,
          breakdownAssignUserStatus.pending_approval,
          breakdownAssignUserStatus.approved,
          breakdownAssignUserStatus.submitted,
        ],
      },
    });
    if (breakdownAssignUsers && breakdownAssignUsers.length > 0) {
      for (const breakdownAssignUser of breakdownAssignUsers) {
        const payloadNoti = {
          notificationTypeCode: notificationTypeCode.overdue_breakdown,
          text: `Sự cố ${breakdown.code} của bạn đã quá hạn làm việc. Vui lòng truy cập để thực hiện công việc`,
          subUrl: `view-my-breakdown/${breakdown._id}`,
          webSubUrl: `breakdown/work-order-breakdown/view/${breakdown._id}`,
          notificationName: "Sự cố quá hạn",
          user: breakdownAssignUser?.user,
        };
        await notificationService.pushNotificationWithUser(payloadNoti);
      }
    }
  }
  return breakdowns;
};

module.exports = {
  overdueBreakdown,
};
