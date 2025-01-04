const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema(
    {
        UserId:
        {
            type: String,
            ref:'Employee',
            required:true
        },
        AnnualLeaves:
        {
            type:Number,
            required:true,
            default:14,
        },
        CasualLeaves:
        {
            type:Number,
            required:true,
            default:7
        },
        leave_balance_annual:
        {
            type:Number,
            required:true
        },
        leave_balance_casual:
        {
            type:Number,
            required:true
        },
        noPay_Leaves:
        {
            type:Number,
            default :0
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
            type:String
        },
        comment:
        {
            type:String
        }
    },
    {
        timestamps:true
    },
);

const Leave = mongoose.model("Leave",LeaveSchema);
module.exports = Leave;
