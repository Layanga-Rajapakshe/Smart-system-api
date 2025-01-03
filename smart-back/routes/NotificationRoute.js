const express = require("express");
const { getNotifications, markNotificationsAsRead } = require("../controllers/NotificationController");
const router = express.Router();
const authenticateUser = require('../middleware/AuthenticateUser');

// Get notifications for the logged-in user
router.get("/", authenticateUser, getNotifications);

router.patch("/mark-read", authenticateUser, markNotificationsAsRead);

module.exports = router;
