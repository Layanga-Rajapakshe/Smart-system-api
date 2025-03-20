const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    section: [[{  // 2D array structure
        parameter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'KPIParameter', // Reference to KPIParameter model
            required: true
        },
        value: {
            type: Number, // Assuming KPI value is numeric (adjust as needed)
            required: true
        }
    }]], 
    
    comment: {
        type: String
    },
    month: {
        type: String,
        required: true,
        match: /^\d{4}-(0[1-9]|1[0-2])$/, // Validates "YYYY-MM" format
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const KPI = mongoose.model('KPI', kpiSchema);
module.exports = KPI;
