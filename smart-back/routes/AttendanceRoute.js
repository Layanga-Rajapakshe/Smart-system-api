const express = require('express');
const router = express.Router();
const { upload, UploadExcellSheet, processAttendanceData, reShowAttendanceRecords, addSalMonth } = require('../controllers/AttendanceController');
const authenticateUser = require('../middleware/AuthenticateAttendance');

// Route for uploading attendance Excel sheet
router.post('/upload', upload.single('file'), UploadExcellSheet);

module.exports = router;
