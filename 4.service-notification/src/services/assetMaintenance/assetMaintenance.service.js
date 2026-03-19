const {
  AssetMaintenanceModel,
  AssetModelSparePartModel,
  SparePartModel,
  HistoryAssetMaintenanceSparePartModel,
} = require("../../models");
const { NotificationTypeModel } = require("../../models/notification");
const { notificationTypeCode } = require("../../utils/constant");
const notificationService = require("../notification/notification.service");

// const partsReplacementNotice = async () => {
//   const today = new Date();
//   const todayStart = startOfDay(today);

//   const notificationType = await NotificationTypeModel.findOneAndUpdate(
//     { code: notificationTypeCode.parts_replacement_notice },
//     {
//       $setOnInsert: {
//         code: notificationTypeCode.parts_replacement_notice,
//         name: "Thông báo thay thế phụ tùng",
//         isNotifyTheManager: true,
//         isPriorNoticeRequired: true,
//         advanceNoticeDays: 3,
//       },
//     },
//     { new: true, upsert: true }
//   );

//   const advanceNoticeDays = notificationType?.advanceNoticeDays ?? 0;

//   const assetMaintenances = await AssetMaintenanceModel.find().lean();
//   for (const assetMaintenance of assetMaintenances) {
//     if (!assetMaintenance.assetModel) continue;

//     const assetModelSpareParts = await AssetModelSparePartModel.find({
//       assetModel: assetMaintenance.assetModel,
//     }).lean();

//     if (!assetModelSpareParts.length) continue;

//     const sparePartIds = assetModelSpareParts.map((i) => i.sparePart);
//     const spareParts = await SparePartModel.find({
//       _id: { $in: sparePartIds },
//     }).lean();

//     const sparePartMap = new Map(
//       spareParts.map((sp) => [sp._id.toString(), sp])
//     );

//     for (const assetModelSparePart of assetModelSpareParts) {
//       const sparePart = sparePartMap.get(
//         assetModelSparePart.sparePart.toString()
//       );
//       if (!sparePart?.lifeSpan || !sparePart?.Period) continue;

//       const lastHistory = await HistoryAssetMaintenanceSparePartModel.findOne({
//         assetMaintenance: assetMaintenance._id,
//         sparePart: assetModelSparePart.sparePart,
//       })
//         .sort({ createdAt: -1 })
//         .lean();

//       if (!lastHistory?.replacementDate) continue;

//       let dueDate = new Date(lastHistory?.replacementDate);

//       switch (sparePart.Period) {
//         case 1:
//           dueDate.setDate(dueDate.getDate() + sparePart.lifeSpan);
//           break;
//         case 2:
//           dueDate.setDate(dueDate.getDate() + sparePart.lifeSpan * 7);
//           break;
//         case 3:
//           dueDate.setMonth(dueDate.getMonth() + sparePart.lifeSpan);
//           break;
//         case 4:
//           dueDate.setFullYear(dueDate.getFullYear() + sparePart.lifeSpan);
//           break;
//       }

//       const notificationDate = new Date(dueDate);
//       notificationDate.setDate(notificationDate.getDate() - advanceNoticeDays);

//       const notifyFrom = startOfDay(notificationDate);
//       const dueDateEnd = endOfDay(dueDate);
//       if (todayStart >= notifyFrom && todayStart <= dueDateEnd ) {
//         await notificationService.pushNotification({
//           notificationTypeCode: notificationTypeCode.parts_replacement_notice,
//           isNotifyTheManager: true,
//           isPriorNoticeRequired: true,
//           notificationName: "Phụ tùng sắp đến hạn thay thế",
//           text: `Phụ tùng ${sparePart.sparePartsName} của tài sản ${
//             assetMaintenance.serial
//               ? "Số sê - ri : " + assetMaintenance.serial
//               : assetMaintenance.assetNumber
//               ? "Mã tài sản : " + assetMaintenance.assetNumber
//               : "ID : " + assetMaintenance._id
//           } sắp đến hạn thay thế. Ngày thay thế là ${dueDate.toLocaleDateString(
//             "vi-VN"
//           )}`,
//           webSubUrl: `quan-ly-tai-san/view/${assetMaintenance._id}`,
//           subUrl: `tai-san/chi-tiet/${assetMaintenance._id}`,
//         });
//       }
//     }
//   }
// };
const partsReplacementNotice = async () => {
  const today = new Date();
  const notificationType = await NotificationTypeModel.findOneAndUpdate(
    { code: notificationTypeCode.parts_replacement_notice },
    {
      $setOnInsert: {
        code: notificationTypeCode.parts_replacement_notice,
        name: "Thông báo thay thế phụ tùng",
        isNotifyTheManager: true,
        isPriorNoticeRequired: true,
        advanceNoticeDays: 3,
      },
    },
    { new: true, upsert: true }
  );

  const advanceNoticeDays = notificationType?.advanceNoticeDays ?? 0;
  const advanceNoticeMs = advanceNoticeDays * 24 * 60 * 60 * 1000;

  const now = new Date();
  const lastHistory = await HistoryAssetMaintenanceSparePartModel.aggregate([
    {
      $lookup: {
        from: "spareparts",
        localField: "sparePart",
        foreignField: "_id",
        as: "sparePart",
      },
    },
    { $unwind: { path: "$sparePart", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        replacementDate: { $ne: null },
        "sparePart.cycleMiles": { $gt: 0 },
      },
    },
    // 1️⃣ Lưu expireDate
    {
      $addFields: {
        expireDate: {
          $add: ["$replacementDate", "$sparePart.cycleMiles"],
        },
      },
    },
    {
      $match: {
        $expr: {
          $lte: [
            {
              $subtract: [
                { $add: ["$replacementDate", "$sparePart.cycleMiles"] },
                advanceNoticeMs,
              ],
            },
            now,
          ],
        },
      },
    },
    // 4Group theo assetMaintenance → lấy bản mới nhất
    {
      $group: {
        _id: "$assetMaintenance",
        lastHistory: { $first: "$$ROOT" },
      },
    },
    {
      $sort: {
        replacementDate: -1,
      },
    },
    // (optional) trả phẳng object
    {
      $replaceRoot: {
        newRoot: "$lastHistory",
      },
    },
  ]);
  console.log("lastHistory", lastHistory);
  for (const history of lastHistory) {
    const assetMaintenance = await AssetMaintenanceModel.findById(
      history.assetMaintenance
    ).lean();
    const sparePart = history.sparePart;
    if (!assetMaintenance || !sparePart) continue;
    const notification = {
      notificationTypeCode: notificationTypeCode.parts_replacement_notice,
      isNotifyTheManager: true,
      isPriorNoticeRequired: true,
      notificationName: "Phụ tùng sắp đến hạn thay thế",
      text: `Phụ tùng ${sparePart.sparePartsName} của tài sản ${
        assetMaintenance.serial
          ? "Số sê - ri : " + assetMaintenance.serial
          : assetMaintenance.assetNumber
          ? "Mã tài sản : " + assetMaintenance.assetNumber
          : "ID : " + assetMaintenance._id
      } sắp đến hạn thay thế. Hạn thay thế là ${history.expireDate.toLocaleDateString(
        "vi-VN"
      )}`,
      webSubUrl: `quan-ly-tai-san/view/${assetMaintenance._id}`,
      subUrl: `tai-san/chi-tiet/${assetMaintenance._id}`,
    };
    await notificationService.pushNotification(notification);
  }
};
module.exports = {
  partsReplacementNotice,
};
