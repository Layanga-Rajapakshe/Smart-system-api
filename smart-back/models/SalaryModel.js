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
    OtDeduction://for labours
    {
        type:Number,
        default:0
    },
    noPayDeductionBasic://staff
    {
        type:Number,
        default:0
    },
    noPayDeductionREallowance://staff
    {
        type:Number,
        default:0
    },
    totalOtEarnings://labours
    {
        type: Number,
        default:0
    },
    nopaydays_ot://Staff, this nopay days are calculated using shortworking hours
    {
        type:Number,
        default:0
    },
    nopaydays://staff,these are get from the leave management
    {
        type:Number,
        default:0
    },
    totalNPdays:
    {
        type: Number,
        default:0
    },
    totalIncomeForTheMonth:
    {
        type:Number,
        default:0
    },
    newBasic:
    {
        type:Number,
        default:0
    },
    newRE:
    {
        type: Number,
        default:0
    },
    EPF_employee:
    {
        type: Number,
        default:0
    },
    EPF_employer:
    {
        type:Number,
        default:0
    },
    FinalSalary:
    {
        type:Number,
        default:0
    },
    otherDeductions:
    {
        type:Number,
        default:0
    }
   
},{
    timestamps: true 
});
const salsketch = mongoose.model('salsketch', salarySchema);

module.exports = salsketch;