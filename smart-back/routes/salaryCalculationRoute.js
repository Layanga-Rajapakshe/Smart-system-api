const express = require('express');
const {calculateSalary } = require('../controllers/SalaryCalculationController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');
const {authenticateUser} = require('../middleware/AuthenticateUser');
const router = express.Router();

router.post('/sketch' ,  calculateSalary);

module.exports = router;
