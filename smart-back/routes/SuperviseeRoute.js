const express = require('express');
const router = express.Router();
const { getSupervisees,SuperviseeTasks } = require('../controllers/EmployeeController');4
const {addComment} = require('../controllers/TwoWeekController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');
const {authenticateUser} = require('../middleware/AuthenticateUser');

router.get('/',authenticateUser,getSupervisees);
router.get('/:id',authenticateUser,SuperviseeTasks);
router.patch('/:taskId/comment',authenticateUser,addComment);

module.exports = router;
