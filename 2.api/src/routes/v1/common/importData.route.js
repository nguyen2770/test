const express = require("express");
const multer = require("multer");
const { importDataController } = require("../../../controllers");
const auth = require("../../../middlewares/auth");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  upload.single("file"),
  auth('uploadAssetMaintenanceExcel'),
  importDataController.uploadAssetMaintenanceExcel
);

module.exports = router;
