const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const billController = require('./controllers/billController');
const invoiceController = require('./controllers/invoiceController');
const purchaseOrderController = require('./controllers/purchaseOrderController');
const ocrController = require('./controllers/ocrController')

// Store documents
router.post('/store-bills', billController.storeBills);
router.post('/store-invoices', invoiceController.storeInvoices);
router.post('/store-purchase-orders', purchaseOrderController.storePurchaseOrders);

router.post('/process', ocrController.processFiles);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/getallusers', userController.getAllUsers);

module.exports = router;