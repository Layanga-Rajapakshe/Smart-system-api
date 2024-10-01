const Role = require('../models/RoleModel');
const Employee = require('../models/EmployeeModel');
const logger = require('../utils/Logger');

// Create a new role
const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        // Check if role with the same name already exists
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: `Role '${name}' already exists.` });
        }

        // Create new role
        const role = new Role({ name, permissions });
        await role.save();

        logger.log(`Role created: ${name}`);
        res.status(201).json(role);
    } catch (error) {
        logger.error(`Failed to create role: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Assign a role to an employee
const assignRoleToEmployee = async (req, res) => {
    try {
        const { employeeId, roleId } = req.body;

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Assign role to employee
        employee.role = roleId;
        await employee.save();

        logger.log(`Role '${role.name}' assigned to employee '${employee.name}'`);
        res.status(200).json({ message: `Role '${role.name}' assigned to employee '${employee.name}'` });
    } catch (error) {
        logger.error(`Failed to assign role: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Get all roles
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (error) {
        logger.error(`Failed to fetch roles: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Get roles based on permissions
const getRolesByPermission = async (req, res) => {
    try {
        const { permission } = req.query;

        // Find roles that contain the given permission
        const roles = await Role.find({ permissions: permission });

        if (roles.length === 0) {
            return res.status(404).json({ message: `No roles found with permission '${permission}'` });
        }

        res.status(200).json(roles);
    } catch (error) {
        logger.error(`Failed to fetch roles by permission: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};
// Update roles by permission
// Update a role by ID
const updateRoleById = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { name, permissions } = req.body;

        // Find role by ID
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Update role's name and permissions
        if (name) role.name = name;
        if (permissions) role.permissions = permissions;

        await role.save();

        logger.log(`Role '${role.name}' updated successfully`);
        res.status(200).json({ message: `Role '${role.name}' updated successfully`, role });
    } catch (error) {
        logger.error(`Failed to update role: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    createRole,
    assignRoleToEmployee,
    getRoles,
    getRolesByPermission,
    updateRoleById
};
