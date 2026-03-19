const express = require('express');

const { supplierController } = require('../../../controllers');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post('/create', auth("createSupplier"), supplierController.createSupplier);
router.get('/get-list', supplierController.getSuppliers);
router.get('/get-by-id', supplierController.getSupplierById);
router.patch('/update', auth("updateSupplier"), supplierController.updateSupplier);
router.patch('/update-status', auth("updateStatus"), supplierController.updateStatus);
router.delete('/delete', auth("deleteSupplier"), supplierController.deleteSupplier);
router.get('/get-all', supplierController.getAllSupplier);
module.exports = router;
