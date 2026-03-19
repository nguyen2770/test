const express = require('express');
const { inventoryController } = require('../../../controllers');


const router = express.Router();

router.get('/get-spare-parts', inventoryController.getInventorySparePart)
router.get('/get-asset-models', inventoryController.getInventoryAssetModel)


module.exports = router;