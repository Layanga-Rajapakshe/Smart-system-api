const Meeting = require("../models/Meeting");
const Notification = require("../models/notification");

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
        const { topic, dateTime, description, meetingRoomId, attendees, todoList, ProjectId } = req.body;

        if (!topic || !dateTime || !description || !meetingRoomId || !attendees || attendees.length === 0 || !ProjectId) {
            return res.status(400).json({ message: "All fields, a valid ProjectId, and at least one attendee are required." });
        }

        // Fetch the most recent meeting for the same project
        const latestMeeting = await Meeting.findOne({ ProjectId }).sort({ dateTime: -1 });

        // Extract spillover tasks (incomplete tasks from the same project)
        const spilloverTasks = latestMeeting
            ? latestMeeting.todoList.filter(task => task.status !== "completed") // Filter incomplete tasks
            : [];

        // Combine new tasks with spillover tasks
        const allTasks = [...spilloverTasks, ...(todoList || [])];

        // Create the new meeting
        const meeting = new Meeting({
            topic,
            dateTime,
            description,
            meetingRoomId,
            attendees,
            todoList: allTasks,
            ProjectId,
        });

        await meeting.save();

        // Notify attendees about the new meeting
        const message = `You have been invited to a meeting: ${topic}`;
        await sendNotifications(attendees, meeting._id, message);

        res.status(201).json({
            message: "Meeting created successfully with spillover tasks.",
            meeting,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create meeting.", error: error.message });
    }
};

// Get all meetings with populated attendees and meeting ID
const getAllMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find()
            .populate("attendees", "name email") // Populates attendee details
            .sort({ dateTime: 1 });

        const formattedMeetings = meetings.map((meeting) => ({
            id: meeting._id,
            topic: meeting.topic,
            dateTime: meeting.dateTime,
            description: meeting.description,
            meetingRoomId: meeting.meetingRoomId,
            attendees: meeting.attendees,
        }));

        res.status(200).json(formattedMeetings);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve meetings", error: error.message });
    }
};

// Get a single meeting by ID with populated attendees and meeting ID
const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findById(id).populate("attendees", "name email");

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json({
            id: meeting._id,
            topic: meeting.topic,
            dateTime: meeting.dateTime,
            description: meeting.description,
            meetingRoomId: meeting.meetingRoomId,
            attendees: meeting.attendees,
        });
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

        res.status(200).json({
            message: "Meeting updated successfully",
            meeting: {
                id: meeting._id,
                topic: meeting.topic,
                dateTime: meeting.dateTime,
                description: meeting.description,
                meetingRoomId: meeting.meetingRoomId,
                attendees: meeting.attendees,
            },
        });
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
