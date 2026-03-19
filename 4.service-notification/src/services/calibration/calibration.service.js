const {
  CalibrationWorkAssignUserModel,
  CalibrationWorkModel,
} = require("../../models");
const {
  calibrationGroupStatus,
  notificationTypeCode,
  calibrationWorkAssignUserStatus,
} = require("../../utils/constant");
const notificationTypeModel = require("../../models/notification/notificationType.model");
const notificationService = require("../notification/notification.service");
const calibrationDeadlineIsApproaching = async (calibrationWorkOverdueIds) => {
  const now = new Date();
  const notificationType = await notificationTypeModel.findOneAndUpdate(
    { code: notificationTypeCode.calibration_deadline_is_approaching },
    {
      $setOnInsert: {
        code: notificationTypeCode.calibration_deadline_is_approaching,
        name: "Sắp đến hạn hiệu chuẩn",
        isNotifyTheManager: true,
        isPriorNoticeRequired: true,
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
  const calibrationWorks = await CalibrationWorkModel.find({
    _id: { $nin: calibrationWorkOverdueIds },
    groupStatus: calibrationGroupStatus.new,
    startDate: {
      $gte: startDateFrom,
      $lte: endDateTo,
    },
  });
  for (const calibrationWork of calibrationWorks) {
    // thông báo người quản lý
    const payloadNoti = {
      notificationTypeCode:
        notificationTypeCode.calibration_deadline_is_approaching,
      text: `Công việc hiệu chuẩn ${calibrationWork.code} sắp đến thời gian làm việc. Ngày làm việc là ${calibrationWork?.startDate}`,
      subUrl: `calibration-work/detail/${calibrationWork._id}`,
      webSubUrl: `calibration/calibration-work/view/${calibrationWork._id}`,
      notificationName: "Sắp đến hạn hiệu chuẩn",
    };
    await notificationService.pushNotification(payloadNoti);
    // thông báo đến người được giao việc
    const calibrationWorkAssignUsers =
      await CalibrationWorkAssignUserModel.find({
        calibrationWork: calibrationWork?._id,
        status: {
          $in: [
            calibrationWorkAssignUserStatus.accepted,
            calibrationWorkAssignUserStatus.assigned,
          ],
        },
      });
    if (calibrationWorkAssignUsers && calibrationWorkAssignUsers.length > 0) {
      for (const calibrationWorkAssignUser of calibrationWorkAssignUsers) {
        const payloadNoti = {
          notificationTypeCode:
            notificationTypeCode.calibration_deadline_is_approaching,
          text: `Công việc hiệu chuẩn ${calibrationWork.code} của bạn đã sắp tới ngày làm việc. Ngày làm việc là ${calibrationWork?.startDate}`,
          subUrl: `my-calibration-work/detail/${calibrationWorkAssignUser._id}`,
          webSubUrl: `calibration/calibration-work/view/${calibrationWorkAssignUser.calibrationWork}`,
          notificationName: "Sắp đến hạn hiệu chuẩn",
          user: calibrationWorkAssignUser?.user,
        };
        await notificationService.pushNotificationWithUser(payloadNoti);
      }
    }
  }
};
const overdueCalibration = async () => {
  const calibrationWorks = await CalibrationWorkModel.aggregate([
    {
      $match: {
        groupStatus: {
          $in: [calibrationGroupStatus.new, calibrationGroupStatus.inProgress],
        },
        $expr: {
          $lt: [
            {
              $add: [
                "$startDate",
                {
                  $multiply: [{ $ifNull: ["$calibrationTimeHr", 0] }, 3600000],
                },
                {
                  $multiply: [{ $ifNull: ["$calibrationTimeMin", 0] }, 60000],
                },
              ],
            },
            "$$NOW",
          ],
        },
      },
    },
  ]);
  for (const calibrationWork of calibrationWorks) {
    const payloadNoti = {
      notificationTypeCode: notificationTypeCode.overdue_calibration,
      isNotifyTheManager: true,
      text: `Công việc hiệu chuẩn ${calibrationWork.code} đã quá hạn. Vui lòng, liên hệ người được giao việc để hoàn thành`,
      subUrl: `calibration-work/detail/${calibrationWork._id}`,
      webSubUrl: `calibration/calibration-work/view/${calibrationWork._id}`,
      notificationName: "Hiệu chuẩn quá hạn",
    };

    await notificationService.pushNotification(payloadNoti);
    // thông báo đến người được giao việc
    const calibrationWorkAssignUsers =
      await CalibrationWorkAssignUserModel.find({
        calibrationWork: calibrationWork?._id,
        status: {
          $in: [
            calibrationWorkAssignUserStatus.accepted,
            calibrationWorkAssignUserStatus.assigned,
            calibrationWorkAssignUserStatus.inProgress,
            calibrationWorkAssignUserStatus.completeRecalibrationIssue,
          ],
        },
      });
    if (calibrationWorkAssignUsers && calibrationWorkAssignUsers.length > 0) {
      for (const calibrationWorkAssignUser of calibrationWorkAssignUsers) {
        const payloadNoti = {
          notificationTypeCode:
            notificationTypeCode.calibration_deadline_is_approaching,
          text: `Công việc hiệu chuẩn ${calibrationWork.code} của bạn đã quá hạn làm việc. Vui lòng truy cập để thực hiện công việc`,
          subUrl: `my-calibration-work/detail/${calibrationWorkAssignUser._id}`,
          webSubUrl: `calibration/calibration-work/view/${calibrationWorkAssignUser.calibrationWork}`,
          notificationName: "Hiệu chuẩn quá hạn",
          user: calibrationWorkAssignUser?.user,
        };
        await notificationService.pushNotificationWithUser(payloadNoti);
      }
    }
  }
  return calibrationWorks;
};
const handleCalibrationIssues = async () => {
  const calibrationWorkOverdues = await overdueCalibration();
  const calibrationWorkOverdueIds = calibrationWorkOverdues.map(
    (data) => data._id
  );
  // const calibrationWorkOverdueIds = []
  // nếu mà thông báo quá hạn rồi thì thôi thông báo đến hạn công việc
  await calibrationDeadlineIsApproaching(calibrationWorkOverdueIds);
};

module.exports = {
  handleCalibrationIssues,
};
