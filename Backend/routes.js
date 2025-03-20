const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const ocrController = require('./controllers/ocrController')
const projectController = require('./controllers/projectController')

router.post('/process', ocrController.processFiles);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/getallusers', userController.getAllUsers);
router.get('/getExcelFile/:file_ID', projectController.exportToExcelFile);
router.get('/excel-data/:file_ID', projectController.getDataEachTable_File_ID);
router.get('/activities/:username', projectController.getAllProject);
router.put('/projects/update/:file_ID', projectController.updateFileName);
router.post('/reset-password', userController.resetPassword);
router.post('/verify-code', userController.verifyCodeAndUpdatePassword);




module.exports = router;