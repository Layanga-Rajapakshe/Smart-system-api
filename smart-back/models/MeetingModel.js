const mongoose = require("mongoose");

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
    meetingRoomId: { // Unique ID for the virtual meeting room
        type: String,
        required: true
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

const Meeting = mongoose.model("Meeting", MeetingSchema);

module.exports = Meeting;
