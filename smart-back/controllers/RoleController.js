const Role = require('../models/RoleModel');
const logger = require('../utils/Logger');

// Create a new role
const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        // Check if role already exists
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        const newRole = new Role({
            name,
            permissions
        });

        await newRole.save();
        logger.log(`New role created: ${name}`);
        res.status(201).json(newRole);
    } catch (error) {
        logger.error(`Failed to create role: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Update role permissions
const updateRolePermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissions } = req.body;

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        role.permissions = permissions;
        await role.save();
        logger.log(`Permissions updated for role: ${role.name}`);
        res.status(200).json(role);
    } catch (error) {
        logger.error(`Failed to update role permissions: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Fetch all roles
const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (error) {
        logger.error(`Failed to fetch roles: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRole,
    updateRolePermissions,
    getAllRoles
};
