const mongoose = require('mongoose');

// Define the Role schema with permissions
const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    permissions: {
        type: [String], 
        default: [] 
    },
    temporaryPermission: {
        type: [String], // Stack-like behavior with an array
        default: []
    }
}, {
    timestamps: true 
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
