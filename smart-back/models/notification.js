const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    userId: { // Employee who receives the notification
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    message: { // Notification message
        type: String,
        required: true
    },
    meetingId: { // Link to the associated meeting
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meeting",
        required: true
    },
    isRead: { // Mark if the notification has been read
        type: Boolean,
        default: false
    },
    contacts:
    {
        type:String
    },
    status:
    {
        type: String,
        enum:["Pending","Resolved"],
        default: "pending"
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
