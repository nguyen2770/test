const mongoose = require("mongoose");
const { toJSON, paginate } = require("../plugins");

const notificationAssetMaintenanceSparePartSchema = mongoose.Schema(
  {
    assetMaintenance: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "AssetMaintenance",
    },
    originSparePart: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    sparePart: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "SparePart",
    },
    quantity: {
      type: Number,
      default: 0,
    },
    replacementDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
notificationAssetMaintenanceSparePartSchema.plugin(toJSON);
notificationAssetMaintenanceSparePartSchema.plugin(paginate);

/**
 * @typedef User
 */
const NotificationAssetMaintenanceSparePart = mongoose.model(
  "NotificationAssetMaintenanceSparePart",
  notificationAssetMaintenanceSparePartSchema
);

module.exports = NotificationAssetMaintenanceSparePart;
