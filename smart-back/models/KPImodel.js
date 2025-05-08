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
    parameterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KPIParameter',
        required: true
    },
    values: {
        type: [[Number]], // 2D array: 5 rows, dynamic columns
        validate: {
            validator: function (arr) {
                return arr.length === 5; // Ensures exactly 5 rows
            },
            message: "Values must have exactly 5 rows."
        },
        required: true
    },
    Total_Kpi:{
        type: Number,

    },
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
