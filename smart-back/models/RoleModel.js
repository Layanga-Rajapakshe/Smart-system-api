const mongoose = require('mongoose');

// Define the Role schema with permissions
const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['Employee', 'Manager', 'CEO', 'Admin', 'Custom'] 
    },
    permissions: {
        type: [String], 
        default: [] 
    }
}, {
    timestamps: true 
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
