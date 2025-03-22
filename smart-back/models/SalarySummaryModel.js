const mongoose = require('mongoose');

const salarySheetSchema = new mongoose.schema({

    employeeType:
        {
            type: String,//staff-epf,staff-non-epf,technician
            enum: ['staffEPF','staffNonEPF','technician'],
            default:"staffEPF",
            required:true
        },
    month:
        {
            type:Date,
            required: true
        },
    totalPay:
        {
            type:Number,
            default:0
    },
    totalEPFemployee:
    {
        type: Number,
        default:0
    },
    totalEPFemployer:
    {
        type:Number,
        defauit:0
    }



})