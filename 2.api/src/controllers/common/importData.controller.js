const path = require('path');
const httpStatus = require('http-status');
const fs = require('fs');
const multer = require('multer');
const { importDataService } = require("../../services");

const uploadAssetMaintenanceExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.send({ code: 0, message: "Not file" })
        }
        const result = await importDataService.uploadAssetMaintenanceExcel(req.file.path, req.file)
        return res.send({ code: 1, result })
    } catch (error) {
        return res.send({ code: 0, message: error.message || "Tải file lên không thành công" })
    }
};

module.exports = {
    uploadAssetMaintenanceExcel,
}
