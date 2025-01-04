const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Use UUID to generate unique IDs

const MeetingSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    ProjectId: {
        type: Number,
        required: true
    },
    ProjectManager: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    description: {
        type: String,
        required: true
    },
    meetingRoomId: { // Auto-generated unique ID for the virtual meeting room
        type: String,
        default: function () { // Use a function to generate a unique value
            return `RM-${uuidv4().slice(0, 8)}`;
        },
        immutable: true // Prevent this field from being updated
    },
    discussionPoints: {
        type: String,
        default: ""
    },
    attendees: [{ // Array of employee IDs (attendees for the meeting)
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    }],
    todoList: [{
        task: { type: String, required: true }, // Task description
        assignedTo: { // Employee assigned to the task
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },
        status: { type: String, enum: ["pending", "completed"], default: "pending" }, // Task status
        spillover: { type: Boolean, default: false } // Indicates if the task is a spillover
    }]
}, { timestamps: true });

// Ensure meetingRoomId is always generated if missing
MeetingSchema.pre("validate", function (next) {
    if (!this.meetingRoomId) {
        this.meetingRoomId = `RM-${uuidv4().slice(0, 8)}`;
    }
    next();
});

const Meeting = mongoose.model("Meeting", MeetingSchema);

module.exports = Meeting;
