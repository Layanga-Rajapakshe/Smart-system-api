const express = require('express');
const {calculateSalary,showsalarysheet,salaryHistory,sendComplaint,replyToComplaint,getChatHistory,salarySummary } = require('../controllers/SalaryCalculationController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');
const {authenticateUser} = require('../middleware/AuthenticateUser');
const router = express.Router();

router.post('/sketch' ,  calculateSalary);
router.get('/showsal/:userId/:month',showsalarysheet);
router.get('/history/:userId',salaryHistory);
router.post('/send',sendComplaint);
router.post('/reply',replyToComplaint);
router.get('/:complaintId/history',getChatHistory);
router.get('/summary/:Etype/:Month',salarySummary);//Etypes -> staff-epf,staff-non-epf,technician

module.exports = router;
