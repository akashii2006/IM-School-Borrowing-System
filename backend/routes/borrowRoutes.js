const express = require('express');
const router = express.Router();
const controller = require('../controllers/borrowController');

router.get('/', controller.getBorrowLogs);
router.post('/', controller.createBorrowRequest);
router.post('/request', controller.createBorrowRequest);
router.put('/approve/:id', controller.approveBorrowRequest);
router.put('/reject/:id', controller.rejectBorrowRequest);
router.post('/requests/:id/return', controller.processReturn);
router.put('/return/:id', controller.processReturn);

module.exports = router;