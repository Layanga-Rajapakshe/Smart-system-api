const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
    {
        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Employee',
            required:true
        },
        requested_day:
        {
            type:Date,
            required:true
        },
        requesting_Date:
        {
            type:Date,
            required:true
        },
        numberOfDays:
        {
            type:Number,//1,1.5,2,2.5 like wise
            required:true,
            default:0
        },
        reason:
        {
            type:String,
            required:true
        },
        is_Accepted:
        {
            type:Boolean,
            default:false
        },
        AcceptedBy_supervisor:
        {
            type:String
        },
        AcceptedBy_CEO:
        {
            type:[String]
        },
        comment:
        {
            type:String
        },
        reciver:
        {
            type:[String]
        }
    },{timestamps:true}
);

const LeaveRequest = mongoose.model("LeaveRequest",leaveRequestSchema);
module.exports = LeaveRequest;