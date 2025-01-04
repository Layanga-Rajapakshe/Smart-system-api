const mongoose = require('mongoose');

const kpiParameterSchema = new mongoose.Schema({
    sections: {
        attitude: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true }, // Weight between 0 and 1
            value: { type: Number, min: 0, max: 10, required: true }
        }],
        habits: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true },
            value: { type: Number, min: 0, max: 10, required: true }
        }],
        skills: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true },
            value: { type: Number, min: 0, max: 10, required: true }
        }],
        performance: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true },
            value: { type: Number, min: 0, max: 10, required: true }
        }],
        knowledge: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true },
            value: { type: Number, min: 0, max: 10, required: true }
        }]
    },
});
const KPIParameter = mongoose.model('KPIParameter', kpiParameterSchema);
module.exports = KPIParameter;