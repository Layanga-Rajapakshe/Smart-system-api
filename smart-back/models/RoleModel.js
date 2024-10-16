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
    hierarchyLevel: {  // Add hierarchy level for roles
        type: Number,
        required: true,
        default: 1  // Higher values indicate higher positions
    }
}, {
    timestamps: true 
});


const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
