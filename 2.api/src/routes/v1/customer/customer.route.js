const express = require('express');
const { customerController } = require('../../../controllers');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post('/create', auth('createCustomer'), customerController.createCustomer);
router.post('/insertMany', auth('insertMany'), customerController.insertMany)
router.get('/get-list', customerController.getCustomers);
router.get('/get-by-id', customerController.getCustomerById);
router.patch('/update', auth('updateCustomer'), customerController.updateCustomer);
router.patch('/update-status', auth('updateStatus'), customerController.updateStatus);
router.delete('/delete', auth('deleteCustomer'), customerController.deleteCustomer);
router.get('/get-all', customerController.getAllCustomers);

module.exports = router;
