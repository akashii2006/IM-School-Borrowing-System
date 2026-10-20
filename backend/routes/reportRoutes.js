const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/property-by-room', reportController.getPropertyByRoom);
router.get('/property-by-custodian', reportController.getPropertyByCustodian);

module.exports = router;