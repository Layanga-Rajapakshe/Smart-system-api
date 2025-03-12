const mongoose = require('mongoose');

const salarySheetSchema = new mongoose.schema({

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
})