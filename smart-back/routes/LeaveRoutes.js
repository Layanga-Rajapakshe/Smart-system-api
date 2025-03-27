const express = require('express');
const {leaveSummary} = require('../controllers/LeaveController');
const router = express.Router();

router.get('/summary/:UserId',leaveSummary);

module.exports = router;