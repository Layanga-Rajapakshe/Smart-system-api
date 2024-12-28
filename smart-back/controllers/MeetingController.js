const Meeting = require("../models/Meeting");

// Create a new meeting
const createMeeting = async (req, res) => {
    try {
        const { topic, dateTime, description, meetingRoomId } = req.body;

        if (!topic || !dateTime || !description || !meetingRoomId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const meeting = new Meeting({ topic, dateTime, description, meetingRoomId });
        await meeting.save();

        res.status(201).json({ message: "Meeting created successfully", meeting });
    } catch (error) {
        res.status(500).json({ message: "Failed to create meeting", error: error.message });
    }
};

// Get all meetings
const getAllMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find().sort({ dateTime: 1 });
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve meetings", error: error.message });
    }
};

// Get a single meeting by ID
const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findById(id);

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
        const updatedData = req.body;

        const updatedMeeting = await Meeting.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedMeeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json({ message: "Meeting updated successfully", updatedMeeting });
    } catch (error) {
        res.status(500).json({ message: "Failed to update meeting", error: error.message });
    }
};

// Delete a meeting
const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMeeting = await Meeting.findByIdAndDelete(id);

        if (!deletedMeeting) {
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
    addDiscussionPoints
};