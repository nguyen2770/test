const express = require('express');

const auth = require('../../../middlewares/auth');
const { reportAssetDepreciationController } = require('../../../controllers');

const router = express.Router();

router.get('/get-report', reportAssetDepreciationController.getAssetDepreciationReport);
router.get('/get-detail-report', reportAssetDepreciationController.getDetailAssetDepreciationReport);


module.exports = router;