const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Employee', 'Manager', 'CEO'], 
        default: 'Employee'
    },
    team: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    age: {
        type: Number,
        required: true
    },
    avatar: {
        type: String 
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', 
        required: true
    }
}, {
    timestamps: true
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
