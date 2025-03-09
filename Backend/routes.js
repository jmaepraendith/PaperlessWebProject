const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const ocrController = require('./controllers/ocrController')

router.post('/process', ocrController.processFiles);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/getallusers', userController.getAllUsers);

module.exports = router;