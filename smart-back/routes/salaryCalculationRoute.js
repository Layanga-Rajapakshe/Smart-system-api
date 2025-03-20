const express = require('express');
const {calculateSalary,showsalarysheet } = require('../controllers/SalaryCalculationController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');
const {authenticateUser} = require('../middleware/AuthenticateUser');
const router = express.Router();

router.post('/sketch' ,  calculateSalary);
router.get('/showsal/:userId/:month',showsalarysheet);

module.exports = router;
