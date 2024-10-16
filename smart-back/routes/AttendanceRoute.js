const express = require('express');
const router = express.Router();
const { upload, UploadExcellSheet, processAttendanceData, reShowAttendanceRecords, addSalMonth,addHolidays } = require('../controllers/AttendanceController');
const authenticateUser = require('../middleware/AuthenticateAttendance');

// Route for uploading attendance Excel sheet
router.post('/upload', upload.single('file'), UploadExcellSheet);
router.post('/uploadholidays', upload.single('file'), addHolidays);

module.exports = router;
