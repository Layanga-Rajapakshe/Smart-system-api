const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    StartingDate: {
        type: Date,
        required: true
    },
    TaskId: {
        type: Number,
        required: true
    },
    Task: {
        type: String,
        required: true
    },
    PriorityLevel: {
        type: Number,
        required: true,
        default: 1
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    TaskType: {
        type: String,
        enum: ['Weekly', 'Daily', 'Monthly', 'Annually'], // Updated for consistent capitalization
        default: 'Daily'
    },
    EstimatedHours: {
        type: Number,
        required: true
    },
    isFinished: {
        type: Boolean,
        default: false
    },
    isFinishedOnTime: {
        type: Boolean
    },
    Comment:
    {
        type: String
    }
});

module.exports = mongoose.model('TaskSchema',TaskSchema);
