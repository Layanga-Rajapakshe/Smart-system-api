const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema(
    {
        UserId:
        {
            type: String,
            ref:'Employee',
            required:true
        },

    },
    {
        timestamps:true
    },
)