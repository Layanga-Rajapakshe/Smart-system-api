const mongoose = require('mongoose');

const kpiParameterSchema = new mongoose.Schema({
    sections: {
        attitude: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true } // Weight between 0 and 1  
        }],
        habits: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true }   
        }],
        skills: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true } 
        }],
        performance: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true }   
        }],
        knowledge: [{
            parameter: { type: String, required: true },
            weight: { type: Number, min: 0, max: 1, required: true }
        }]
    },
});
const KPIParameter = mongoose.model('KPIParameter', kpiParameterSchema);
module.exports = KPIParameter;