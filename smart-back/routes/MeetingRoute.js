const express = require("express");
const router = express.Router();
const { getAllMeetings, getMeetingById, createMeeting, updateMeeting, deleteMeeting, addDiscussionPoints,getMeetingsByProjectId } = require("../controllers/MeetingController");
const checkPermissionMiddleware = require('../middleware/CheckPermission');
// Get all meetings
router.get("/", getAllMeetings);
router.get("/:id", getMeetingById);
router.post("/", createMeeting);
router.put("/:id", updateMeeting);
router.delete("/:id", deleteMeeting);
router.patch("/:id/discussion-points", addDiscussionPoints);
router.get("/project/:projectId", getMeetingsByProjectId);

module.exports = router;
