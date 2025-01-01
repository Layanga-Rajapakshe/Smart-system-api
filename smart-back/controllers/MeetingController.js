const Meeting = require("../models/Meeting");
const Notification = require("../models/notification");
const Employee = require("../models/Employee");

// Helper function to send notifications to attendees
const sendNotifications = async (attendees, meetingId, message) => {
    const notifications = attendees.map((attendeeId) => ({
        userId: attendeeId,
        message,
        meetingId,
    }));

    await Notification.insertMany(notifications);
};

// Create a new meeting
const createMeeting = async (req, res) => {
    try {
        const { topic, dateTime, description, meetingRoomId, attendees } = req.body;

        if (!topic || !dateTime || !description || !meetingRoomId || !attendees || attendees.length === 0) {
            return res.status(400).json({ message: "All fields and at least one attendee are required" });
        }

        const meeting = new Meeting({
            topic,
            dateTime,
            description,
            meetingRoomId,
            attendees,
        });

        await meeting.save();

        // Send notifications to attendees
        const message = `You have been invited to a meeting: ${topic}`;
        await sendNotifications(attendees, meeting._id, message);

        res.status(201).json({ message: "Meeting created successfully", meeting });
    } catch (error) {
        res.status(500).json({ message: "Failed to create meeting", error: error.message });
    }
};

// Get all meetings
const getAllMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find()
            .populate("attendees", "name email")
            .sort({ dateTime: 1 });

        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve meetings", error: error.message });
    }
};

// Get a single meeting by ID
const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findById(id).populate("attendees", "name email");

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json(meeting);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve meeting", error: error.message });
    }
};

// Update a meeting
const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { attendees, ...updatedData } = req.body;

        const meeting = await Meeting.findById(id);
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        if (attendees) {
            meeting.attendees = attendees;

            // Send notifications to newly added attendees
            const message = `The meeting "${meeting.topic}" has been updated. Please check the details.`;
            await sendNotifications(attendees, meeting._id, message);
        }

        Object.assign(meeting, updatedData);
        await meeting.save();

        res.status(200).json({ message: "Meeting updated successfully", meeting });
    } catch (error) {
        res.status(500).json({ message: "Failed to update meeting", error: error.message });
    }
};

// Delete a meeting
const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;

        const meeting = await Meeting.findByIdAndDelete(id);

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json({ message: "Meeting deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete meeting", error: error.message });
    }
};

// Add or update discussion points after a meeting
const addDiscussionPoints = async (req, res) => {
    try {
        const { id } = req.params;
        const { discussionPoints } = req.body;

        const meeting = await Meeting.findById(id);

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        meeting.discussionPoints = discussionPoints;
        await meeting.save();

        res.status(200).json({ message: "Discussion points updated successfully", meeting });
    } catch (error) {
        res.status(500).json({ message: "Failed to update discussion points", error: error.message });
    }
};

module.exports = {
    createMeeting,
    getAllMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    addDiscussionPoints,
};
