const mongoose = require('mongoose');
const { SchemaTypes } = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const assetMaintenanceDocumentSchema = mongoose.Schema(
    {
        assetMaintenanceId: {
            type: SchemaTypes.ObjectId,
            default: null,
            ref: 'AssetMaintenance',
        },
        assetMaintenanceDefectId: {
            type: SchemaTypes.ObjectId,
            default: null,
            ref: 'AssetMaintenanceDefect',
        },
        attachFileName: {
            type: String,
            default: null,
        },
        attachType: {
            type: Number,
            default: null,
        },
        isOthersAttachType: {
            type: String,
            default: null,
        },
        attachmentFilePath: {
            type: String,
            default: true,
        },
        resourceId: {
            type: SchemaTypes.ObjectId,
            ref: 'Resource',
            default: null,
        },
    },

    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
assetMaintenanceDocumentSchema.plugin(toJSON);
assetMaintenanceDocumentSchema.plugin(paginate);

/**
 * @typedef User
 */
const AssetMaintenanceDocument = mongoose.model('AssetMaintenanceDocument', assetMaintenanceDocumentSchema);

module.exports = AssetMaintenanceDocument;
