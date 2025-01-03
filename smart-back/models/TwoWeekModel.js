const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    UserId: {
        type: String,
        ref: 'Employee',
        required: true
    },
    StartingDate: {
        type: Date,//required only for weekly tasks, for daily tasks and week tasks, this should be null
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
    TaskType: {//this should be filled if only recurring is true!!
        type: String,
        enum: ['Weekly', 'Daily', 'Monthly', 'Annually'],
        default: 'Daily'
    },
    EstimatedHours: {
        type: Number,
        required: true
    },
    deadLine: {
        type: Date,// for weeekly tasks , this is a must ( make sure no null values entered from the front end)

    },
    isFinished: {
        type: Boolean,
        default: false //IN KPI, Get count of the false for each user(past weeks, do not count this week), and use that count to evaluate each user! 
    },
    isFinishedOnTime: {
        type: Boolean
    },
    Comment: {
        type: String
    },
    actualHours: {
        type: Number
    }
}, { timestamps: true }); // Add timestamps to manage createdAt and updatedAt fields

const Tasks= mongoose.model('Tasks', TaskSchema); // Correct export
module.exports = Tasks;