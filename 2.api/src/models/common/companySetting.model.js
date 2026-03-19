const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const companySettingSchema = mongoose.Schema(
    {
        branchDataHierarchy: {
            type: Boolean,
            default: false
        },
        company: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Company',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);
// add plugin that converts mongoose to json
companySettingSchema.plugin(toJSON);
companySettingSchema.plugin(paginate);

/**
 * @typedef User
 */
const CompanySetting = mongoose.model('CompanySetting', companySettingSchema);

module.exports = CompanySetting;
