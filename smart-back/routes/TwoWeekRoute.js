const express = require('express');
const router = express.Router();
const { addNewTask, addNewTask_recurring,showNextWeek,showPrevWeek,showThisWeek,getTotalAllocatedTimeThisWeek,getTotalAllocatedTimeNextWeek,getTotalAllocatedTimePrevWeek,finishAtask } = require('../controllers/TwoWeekController');
const authenticateUser = require('../middleware/AuthenticateAttendance');




router.post('/addnewtask', addNewTask);
router.get('/thisweek',showThisWeek);
router.get('/prevweek',showPrevWeek);
router.get('/nextweek',showNextWeek);
router.get('/getallocatedtime',getTotalAllocatedTimeThisWeek);
router.get('/finsishatask',finishAtask);




module.exports = router;