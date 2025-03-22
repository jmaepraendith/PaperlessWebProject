const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const ocrController = require('./controllers/ocrController')
const projectController = require('./controllers/projectController')

router.post('/process', ocrController.processFiles);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/getallusers', userController.getAllUsers);
router.get('/excel-data/:file_ID', projectController.getDataEachTable_File_ID);
router.get('/get-column-each-table/:file_ID', projectController.getColumnEachTable);
router.get('/activities/:username', projectController.getAllProject);
router.put('/projects/update/:file_ID', projectController.updateFileName);
router.post('/reset-password', userController.resetPassword);
router.post('/verify-code', userController.verifyCodeAndUpdatePassword);
router.delete('/deleteProject/:file_ID', projectController.deleteRecordsbyfileID);
router.post('/exportToExcelFile/:file_ID', projectController.exportToExcelFile);
router.get('/getExcelFile/:file_ID', projectController.getExcelFile);
router.get('/getExcelFileGuest/:file_ID', projectController.getExcelFileGuest);
router.get('/getExcelFileallcolumn/:file_ID', projectController.allcolumnExcelFile);
router.get('/getFileLinkfromDrive/:file_ID', projectController.getFileLinkfromDrive);

module.exports = router;