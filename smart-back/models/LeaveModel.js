const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema(
    {
        UserId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Employee',
            required:true
        },
        year:
        {
            type:Number,
            required:true
        },
        /*AnnualLeaves:
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
        },*/
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
        }
    },
    {
        timestamps:true
    },
);

const Leave = mongoose.model("Leave",LeaveSchema);
module.exports = Leave;
