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
    }]
}, { timestamps: true });

const Meeting = mongoose.model("Meeting", MeetingSchema);

module.exports = Meeting;
