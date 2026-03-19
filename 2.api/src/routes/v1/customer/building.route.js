const express = require('express');
const { buildingController } = require('../../../controllers');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post('/create', auth("createBuilding"), buildingController.createBuilding);
router.get('/get-list', buildingController.getBuildings);
router.get('/get-by-id', buildingController.getBuildingById);
router.patch('/update', auth("updateBuilding"), buildingController.updateBuilding);
router.patch('/update-status', auth("updateStatus"), buildingController.updateStatus);
router.delete('/delete', auth("deleteBuilding"), buildingController.deleteBuilding);
router.get('/get-all', buildingController.getAllBuilding);

module.exports = router;