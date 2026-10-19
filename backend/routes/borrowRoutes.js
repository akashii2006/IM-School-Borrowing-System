const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

router.get('/', borrowController.getBorrowLogs);
router.post('/', borrowController.createBorrowLog);
router.post('/return', borrowController.returnItem);

module.exports = router;