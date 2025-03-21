const express = require('express');
const router = express.Router();
const { addNewTask,showNextWeek,showPrevWeek,showThisWeek,getTotalAllocatedTimeThisWeek,finishAtask,showAny_WeeklyTasks,showAny_TaskList,addComment } = require('../controllers/TwoWeekController');
const {authenticateUser} = require('../middleware/AuthenticateAttendance');




router.post('/addnewtask', addNewTask);
router.get('/thisweek/:userId',showThisWeek);
router.get('/prevweek/:userId',showPrevWeek);
router.get('/nextweek/:userId',showNextWeek);
router.get('/getallocatedtime',getTotalAllocatedTimeThisWeek);
router.post('/finsishatask',finishAtask);
router.get('/weeklytasks',showAny_WeeklyTasks);
router.get('/showrecurringtasks/:userId/:taskType',showAny_TaskList);





module.exports = router;