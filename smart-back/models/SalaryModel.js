const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Employee',
        required:true
    },
    month:
    {
        type:Date,
        required: true
    },
    totalExtraWorkingHrs:
    {
        type:String,
        default:"00:00:00"
    },
    totalShortWorkingHrs:
    {
        type:String,
        default:"00:00:00"
    },
    totalSingleOt:
    {
        type:String,
        default:"00:00:00"
    },
    totalDoubleOt:
    {
        type:String,
        default:"00:00:00"
    },
    totalPoyaOt:
    {
        type:String,
        default:"00:00:00"
    },
    days:
    {
        type:Number,
        default:0
    },
    mealAdvance:
    {
        type:Number,
        default:0
    },
    sallaryAdvance:
    {
        type:Number,
        default:0
    },
    OtEarnings:
    {
        type:Number,
        default:0
    },
    OtDeduction:
    {
        type:Number,
        default:0
    },
    noPayDeductionBasic:
    {
        type:Number,
        default:0
    },
    noPayDeductionREallowance:
    {
        type:Number,
        default:0
    },
    totalnopayDeductions:
    {
        type :Number,
        default:0
    },
    totalOtEarnings:
    {
        type: Number,
        default:0
    },
    noPayDeduction:
    {
        type:Number,
        default:0
    },



   
},{
    timestamps: true 
});
const Salary = mongoose.model('Salary', salarySchema);

module.exports = Salary;