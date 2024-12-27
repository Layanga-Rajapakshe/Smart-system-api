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

module.exports = mongoose.model('Task', TaskSchema); // Correct export
module.exports = Task;