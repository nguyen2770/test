const express = require('express');
const { branchController } = require('../../../controllers');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post('/create', auth("createBranch"), branchController.createBranch);
router.get('/get-list', branchController.getBranches);
router.get('/get-by-id', branchController.getBranchById);
router.patch('/update', auth('updateBranch'), branchController.updateBranch);
router.delete('/delete', auth('deleteBranch'), branchController.deleteBranch);
router.get('/get-all', branchController.getAllBranches);

module.exports = router;