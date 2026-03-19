const express = require('express');
const { assetMaintenanceController } = require('../../../controllers');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post('/create', auth('createAssetMaintenance'), assetMaintenanceController.createAssetMaintenance);
router.patch('/get-list', auth('getAssetMaintenances'), assetMaintenanceController.getAssetMaintenances);
router.get('/get-by-id', assetMaintenanceController.getAssetMaintenanceById);
router.patch('/update', auth('updateAssetMaintenance'), assetMaintenanceController.updateAssetMaintenance);
router.get('/get', assetMaintenanceController.getAssetMaintenance);
router.patch('/update-status', auth('updateStatus'), assetMaintenanceController.updateStatus);
router.delete('/delete', auth('deleteAssetMaintenance'), assetMaintenanceController.deleteAssetMaintenance);
router.delete('/delete-list', auth('deleteManyAssetMaintenance'), assetMaintenanceController.deleteManyAssetMaintenance);
router.get('/get-all', assetMaintenanceController.getAllAssetMaintenance);
router.get('/get-all-sub', assetMaintenanceController.getAllSub);
router.get('/get-asset-model-by-res', assetMaintenanceController.getAssetModelRes);
router.get('/get-all-asset-model', assetMaintenanceController.getAllAssetModel);
router.get('/get-asset-maintenance-res', assetMaintenanceController.getAssetMaintenanceRes);
router.post(
    '/create-location-history',
    auth('createAssetMaintenanceLocationHistory'),
    assetMaintenanceController.createAssetMaintenanceLocationHistory
);
router.get('/get-location-history-by-res', assetMaintenanceController.getAssetMaintenanceLocationHistoryByRes);
router.get('/get-all-downtime/:id', assetMaintenanceController.getAllDownTimeAssetMaintenance);
router.get('/get-asset-summary', assetMaintenanceController.getAssetSummary);
router.get(
    '/get-asset-maintenance-due-inspections',
    auth('getAssetMaintenanceDueInspections'),
    assetMaintenanceController.getAssetMaintenanceDueInspections
);
router.get('/update-data', assetMaintenanceController.updateData);
router.patch('/get-list-mobile', auth('getAssetMaintenanceMobile'), assetMaintenanceController.getAssetMaintenanceMobile);

module.exports = router;
