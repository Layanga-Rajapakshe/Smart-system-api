const express = require("express");
const router = express.Router();
const { getAllMeetings, getMeetingById, createMeeting, updateMeeting, deleteMeeting, addDiscussionPoints,getMeetingsByProjectId } = require("../controllers/MeetingController");
const checkPermissionMiddleware = require('../middleware/CheckPermission');
const {authenticateUser} = require('../middleware/AuthenticateUser');
// Get all meetings
router.get("/",authenticateUser, getAllMeetings);
router.get("/:id",authenticateUser, getMeetingById);
router.post("/",authenticateUser, createMeeting);
router.put("/:id",authenticateUser, updateMeeting);
router.delete("/:id",authenticateUser, deleteMeeting);
router.patch("/:id/discussion-points",authenticateUser, addDiscussionPoints);
router.get("/project/:projectId",authenticateUser, getMeetingsByProjectId);

module.exports = router;
