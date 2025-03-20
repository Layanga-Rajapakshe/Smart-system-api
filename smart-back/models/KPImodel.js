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
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KPIParameter', // Reference to KPIParameter document
        required: true
    },
    values: {
        attitude: [{ value: { type: Number, min: 0, max: 5, required: true } }],
        habits: [{ value: { type: Number, min: 0, max: 5, required: true } }],
        skills: [{ value: { type: Number, min: 0, max: 5, required: true } }],
        performance: [{ value: { type: Number, min: 0, max: 5, required: true } }],
        knowledge: [{ value: { type: Number, min: 0, max: 5, required: true } }]
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
