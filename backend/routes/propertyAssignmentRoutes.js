const express = require('express');
const router = express.Router();
const controller = require('../controllers/propertyAssignmentController');

router.get('/', controller.getPropertyAssignments);
router.post('/', controller.createPropertyAssignment);
router.put('/:id/unassign', controller.unassignProperty);

module.exports = router;