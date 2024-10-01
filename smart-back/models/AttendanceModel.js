const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee',
        required: true
    },
    Date: {
        type: Date,
        required: true
    },
    In: {
        type: Date // Store times as Date 
    },
    Out: {
        type: Date // Store times as Date
    },
    TimePeriod: {
        type: Number, // Store the time difference in minutes and hours
    },
    isLeave: {
        type: Boolean,
        default: false 
    },
    stdHours:
    {
        type: Number,
    },
    extraWorkingHrs:
    {
        type: Number
    },
    shortWorkingHrs:
    {
        type: Number
    },
    singleOt:
    {
        type:Number
    },
    doubleOt:
    {
        type:Number
    },
    poyaOt:
    {
        type:Number
    }
}, { 
    timestamps: true
});

const Attendance = mongoose.model('Attendance', AttendanceSchema);
module.exports = Attendance;
