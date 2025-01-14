const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Use UUID to generate unique IDs

const meetingSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    meetingId: {
      type: String,
      required: true,
      unique: true, // Ensures the meeting ID is unique
      default: function () {
        return `M-${uuidv4().slice(0, 8)}`; // Unique meeting ID
      },
    },
    restrictedEdit: {
        type: Boolean,
        default: false, // This will be set to true once a new meeting is created for the same project
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId, // ObjectId to reference Project model
      ref: "Project",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    meetingRoomId: {
      type: String,
      default: function () {
        return `RM-${uuidv4().slice(0, 8)}`; // Unique room ID
      },
      immutable: true, // Prevent this field from being updated
    },
    discussionPoints: {
      type: String,
      default: "",
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },
    ],
    todoList: [
      {
        task: { type: String, required: true }, // Task description
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "completed"],
          default: "pending",
        }, // Task status
        spillover: { type: Boolean, default: false }, // Indicates if the task is a spillover
      },
    ],
  },
  { timestamps: true }
);

// Ensure meetingRoomId is always generated if missing
meetingSchema.pre("validate", function (next) {
  if (!this.meetingRoomId) {
    this.meetingRoomId = `RM-${uuidv4().slice(0, 8)}`;
  }
  next();
});

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;
