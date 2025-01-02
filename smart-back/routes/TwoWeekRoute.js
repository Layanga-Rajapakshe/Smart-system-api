const express = require('express');
const router = express.Router();
const { addNewTask,showNextWeek,showPrevWeek,showThisWeek,getTotalAllocatedTimeThisWeek,finishAtask,showAny_WeeklyTasks,showAny_TaskList } = require('../controllers/TwoWeekController');
const authenticateUser = require('../middleware/AuthenticateAttendance');




router.post('/addnewtask', addNewTask);
router.get('/thisweek',showThisWeek);
router.get('/prevweek',showPrevWeek);
router.get('/nextweek',showNextWeek);
router.get('/getallocatedtime',getTotalAllocatedTimeThisWeek);
router.post('/finsishatask',finishAtask);
router.get('/weeklytasks',showAny_WeeklyTasks);
router.get('/showrecurringtasks',showAny_TaskList);




module.exports = router;