const Meeting = require("../models/MeetingModel");
const Notification = require("../models/notification");
const Project = require("../models/ProjectModel"); 


// Helper function to send notifications to attendees
const sendNotifications = async (attendees, meetingId, message) => {
    const notifications = attendees.map((attendeeId) => ({
        userId: attendeeId,
        message,
        meetingId,
    }));
    await Notification.insertMany(notifications);
};
// Modified backend function to fix the notification error issue
const createMeeting = async (req, res) => {
    try {
        const { topic, dateTime, description, meetingRoomId, attendees, todoList, projectId, projectManager } = req.body;
        
        // Validate the required fields
        if (!topic || !dateTime || !description || !attendees || attendees.length === 0 || !projectId) {
            return res.status(400).json({ message: "All fields, a valid projectId, and at least one attendee are required." });
        }
        
        // Validate that the ProjectId corresponds to an existing project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Invalid projectId, project not found." });
        }
        
        // Fetch the most recent meeting for the same project
        const latestMeeting = await Meeting.findOne({ projectId }).sort({ dateTime: -1 });
        
        // If a meeting already exists for the project, mark the previous ones as restricted from editing
        if (latestMeeting) {
            await Meeting.updateMany({ projectId, _id: { $ne: latestMeeting._id } }, { $set: { restrictedEdit: true } });
        }
        
        // Create the new meeting
        const meeting = new Meeting({
            topic,
            projectManager,
            dateTime,
            description,
            meetingRoomId,
            attendees,
            todoList,
            projectId,
        });
        
        // Save the meeting first
        await meeting.save();
        
        // Try to send notifications, but don't let it block the response
        try {
            // Notify attendees about the new meeting
            const message = `You have been invited to a meeting: ${topic}`;
            await sendNotifications(attendees, meeting._id, message);
        } catch (notificationError) {
            // Log the notification error but don't fail the whole request
            console.error("Failed to send notifications:", notificationError);
            // You could also log this to a monitoring system
        }
        
        // Return success regardless of notification status
        res.status(201).json({
            message: "Meeting created successfully with spillover tasks.",
            meeting,
        });
    } catch (error) {
        console.error("Error creating meeting:", error);
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
            ProjectId: meeting.ProjectId,
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

// Get a single meeting by ID with populated attendees and all required fields
const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findById(id).populate("attendees", "name email");

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json({
            _id: meeting._id,
            meetingId: meeting._id, // The frontend uses meetingId to display the ID
            topic: meeting.topic,
            dateTime: meeting.dateTime,
            description: meeting.description,
            meetingRoomId: meeting.meetingRoomId,
            attendees: meeting.attendees.map(att => att._id || att), // Return IDs, handling both populated and unpopulated cases
            projectId: meeting.projectId,
            discussionPoints: meeting.discussionPoints || "",
            todoList: meeting.todoList || [],
            restrictedEdit: meeting.restrictedEdit || false
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve meeting", error: error.message });
    }
};

// Update a meeting
const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { attendees, todoList, ...updatedData } = req.body;
        
        const meeting = await Meeting.findById(id);
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }
        
        // Prevent editing if restricted
        if (meeting.restrictedEdit) {
            return res.status(403).json({ message: "This meeting is restricted from editing." });
        }
        
        // Update attendees
        if (attendees) {
            meeting.attendees = attendees;
            
            // Send notifications to newly added attendees
            const message = `The meeting "${meeting.topic}" has been updated. Please check the details.`;
            try {
                await sendNotifications(attendees, meeting._id, message);
            } catch (notifyError) {
                console.error("Error sending notifications:", notifyError);
                // Continue with the update even if notifications fail
            }
        }
        
        // Update todoList if provided
        if (todoList) {
            meeting.todoList = todoList; // Replace with new todoList
        }
        
        // Update other fields
        Object.assign(meeting, updatedData);
        await meeting.save();
        
        res.status(200).json({
            message: "Meeting updated successfully",
            meeting: {
                _id: meeting._id,  // Include this for consistency
                meetingId: meeting._id,  // Include this as frontend expects it
                topic: meeting.topic,
                dateTime: meeting.dateTime,
                description: meeting.description,
                meetingRoomId: meeting.meetingRoomId,
                projectId: meeting.projectId,
                attendees: meeting.attendees,
                todoList: meeting.todoList,
                restrictedEdit: meeting.restrictedEdit || false,
                discussionPoints: meeting.discussionPoints || ""
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

// Get meetings by ProjectId with populated Project and attendees
const getMeetingsByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;

        const meetings = await Meeting.find({ ProjectId: projectId })
            .populate("attendees", "name email")
            .populate({
                path: "ProjectId",
                select: "projectName", // Populate project name from Project model
            });

        if (meetings.length === 0) {
            return res.status(404).json({ message: "No meetings found for this project." });
        }

        const projectName = meetings[0].ProjectId ? meetings[0].ProjectId.projectName : `Project ${projectId}`;

        res.status(200).json({
            projectName,
            meetings: meetings.map((meeting) => ({
                id: meeting._id,
                topic: meeting.topic,
                dateTime: meeting.dateTime,
                description: meeting.description,
                ProjectName: projectName,
                attendees: meeting.attendees.map((attendee) => attendee.name),
            })),
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch meetings by project ID.", error: error.message });
    }
};

module.exports = {
    createMeeting,
    getAllMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    addDiscussionPoints,
    getMeetingsByProjectId,
};