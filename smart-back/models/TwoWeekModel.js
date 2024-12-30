const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    UserId: {
        type: String,
        ref: 'Employee',
        required: true
    },
    StartingDate: {
        type: Date,
        required: true
    },
    TaskId: {
        type: String,
        required: true
    },
    Task: {
        type: String,
        required: true
    },
    PriorityLevel: {
        type: String, // Changed from Number to String
    enum: ['High', 'Medium', 'Low'], // Defined allowed values
    required: true,
        default: "Medium"
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    TaskType: {
        type: String,
        enum: ['Weekly', 'Daily', 'Monthly', 'Annually'],
        default: 'Daily'
    },
    EstimatedHours: {
        type: Number,
        required: true
    },
    deadLine: {
        type: Date,
    },
    isFinished: {
        type: Boolean,
        default: false
    },
    isFinishedOnTime: {
        type: Boolean
    },
    Comment: {
        type: String
    }
}, { timestamps: true }); // Add timestamps to manage createdAt and updatedAt fields

const Tasks= mongoose.model('Tasks', TaskSchema); // Correct export
module.exports = Tasks;