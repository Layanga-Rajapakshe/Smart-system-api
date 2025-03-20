const express = require('express');
const {calculateSalary,showsalarysheet,salaryHistory } = require('../controllers/SalaryCalculationController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');
const {authenticateUser} = require('../middleware/AuthenticateUser');
const router = express.Router();

router.post('/sketch' ,  calculateSalary);
router.get('/showsal/:userId/:month',showsalarysheet);
router.get('/history/:userId',salaryHistory);

module.exports = router;
