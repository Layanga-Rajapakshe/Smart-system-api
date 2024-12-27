const express = require('express');
const router = express.Router();
const { addNewTask, addNewTask_recurring,showNextWeek,showPrevWeek,showThisWeek,getTotalAllocatedTimeThisWeek,getTotalAllocatedTimeNextWeek,getTotalAllocatedTimePrevWeek,finishAtask } = require('../controllers/TwoWeekController');
const authenticateUser = require('../middleware/AuthenticateAttendance');




router.post('/addnewtask', addNewTask);
router.get('/thisweek',showThisWeek);



module.exports = router;