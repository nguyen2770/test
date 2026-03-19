const express = require('express');
const { floorController } = require('../../../controllers');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post('/create', auth('createFloor'), floorController.createFloor);
router.get('/get-list', floorController.getFloors);
router.get('/get-by-id', floorController.getFloorById);
router.patch('/update', auth('updateFloor'), floorController.updateFloor);
router.patch('/update-status', auth('updateStatus'), floorController.updateStatus);
router.delete('/delete', auth('deleteFloor'), floorController.deleteFloor);
router.get('/get-all', floorController.getAllFloor);

module.exports = router;