const express = require('express');
const router = express.Router();
const { upload, UploadExcellSheet, processAttendanceData, reShowAttendanceRecords, addSalMonth,addHolidays,removeHoliday,getHoliday,getHolidays,editAttendanceRecord } = require('../controllers/AttendanceController');
const authenticateUser = require('../middleware/AuthenticateAttendance');

// Route for uploading attendance Excel sheet
router.post('/upload', upload.single('file'), UploadExcellSheet);
router.post('/uploadholidays', upload.single('file'), addHolidays);
router.delete('/deleteholiday/:date', removeHoliday);
router.get('/getholiday/:date',getHoliday);
router.get('/getholidays/:year',getHolidays);
router.post('/addsalmonth/:month',addSalMonth);
router.get('/getattendancedetails/:userId/:month',reShowAttendanceRecords);
router.put('/editAttendanceRec',editAttendanceRecord);
module.exports = router;
