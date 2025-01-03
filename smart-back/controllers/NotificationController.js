const Notification = require("../models/notification");

const getNotifications = async (req, res) => {
    try {
    
        const loggedInUserId = req.user.id;

    
        const notifications = await Notification.find({ userId: loggedInUserId })
            .sort({ createdAt: -1 }); 

        res.status(200).json({
            message: "Notifications fetched successfully",
            notifications,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
    }
};

const markNotificationsAsRead = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;

        // Update all unread notifications for the logged-in user
        await Notification.updateMany(
            { userId: loggedInUserId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: "Notifications marked as read successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to mark notifications as read", error: error.message });
    }
};

module.exports = {
    getNotifications,
    markNotificationsAsRead,
};
