const express = require("express");
const router = express.Router();
const { getAllMeetings, getMeetingById, createMeeting, updateMeeting, deleteMeeting, addDiscussionPoints,getMeetingsByProjectId } = require("../controllers/MeetingController");
const checkPermissionMiddleware = require('../middleware/CheckPermission');
// Get all meetings
router.get("/", getAllMeetings);

// Get a single meeting by ID
router.get("/:id", getMeetingById);

// Create a new meeting
router.post("/", createMeeting);

// Update a meeting
router.put("/:id", updateMeeting);

// Delete a meeting
router.delete("/:id", deleteMeeting);

// Add or update discussion points
router.patch("/:id/discussion-points", addDiscussionPoints);

// Get meetings by project ID
router.get("/project/:projectId", getMeetingsByProjectId);


module.exports = router;
