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
        type: String // Store times as Date 
    },
    Out: {
        type: String // Store times as Date
    },
    TimePeriod: {
        type: String,
        default:"00:00:00" // Store the time difference in minutes and hours
    },
    isLeave: {
        type: Boolean,
        default: false 
    },
    stdHours:
    {
        type: String,
        default:"09:00:00"
    },
    extraWorkingHrs:
    {
        type: String,
        default:"00:00:00"

    },
    shortWorkingHrs:
    {
        type: String,
        default:"00:00:00"
    },
    singleOt:
    {
        type:String,
        default:"00:00:00"
    },
    doubleOt:
    {
        type:String,
        default:"00:00:00"
    },
    poyaOt:
    {
        type:String,
        default:"00:00:00"
    },
    holiday:
    {
        type:Number//2-sunday,3-poya,4-public
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
