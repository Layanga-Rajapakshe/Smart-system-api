const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    UserId: {
        type: Number, 
        ref: 'Employee',
        required: true
    },
    Date: {
        type: Date,
        required: true
    },
    In: {
        type: String // Store times as Date 
    },
    Out: {
        type: String // Store times as Date
    },
    TimePeriod: {
        type: String,
        default:0 // Store the time difference in minutes and hours
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
    },
    holiday:
    {
        type:Number//0-not a holiday,1-saturday,2-sunday,3-poya,4-public
    },
    isHoliday:
    {
        type:Boolean
    }
}, { 
    timestamps: true
});

const Attendance = mongoose.model('Attendance', AttendanceSchema);
module.exports = Attendance;
