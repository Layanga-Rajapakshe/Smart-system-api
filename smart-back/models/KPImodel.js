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
    sections: {
        attitude: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true }, // Weight between 0 and 1
            value: { type: Number, min: 0, max: 5, required: true }
        }],
        habits: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true },
            value: { type: Number, min: 0, max: 5, required: true }
        }],
        skills: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true },
            value: { type: Number, min: 0, max: 5, required: true }
        }],
        performance: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true },
            value: { type: Number, min: 0, max: 5, required: true }
        }],
        knowledge: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true },
            value: { type: Number, min: 0, max: 5, required: true }
        }]
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
