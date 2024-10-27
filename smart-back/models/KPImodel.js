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
    attitude: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    habits: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    skills: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    performance: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    knowledge: {
        type: Number,
        min: 0,
        max: 5,
        required: true
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
