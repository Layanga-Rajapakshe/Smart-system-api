const Role = require('../models/RoleModel');
const Employee = require('../models/EmployeeModel');
const logger = require('../utils/Logger');

// Create a new role
const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: `Role '${name}' already exists.` });
        }

        const role = new Role({ name, permissions });
        await role.save();

        logger.log(`Role created: ${name}`);
        res.status(201).json(role);
    } catch (error) {
        logger.error(`Failed to create role: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Assign a role to an employee
const assignRoleToEmployee = async (req, res) => {
    try {
        const { employeeId, roleId } = req.body;

        const [employee, role] = await Promise.all([
            Employee.findById(employeeId),
            Role.findById(roleId)
        ]);

        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        if (!role) return res.status(404).json({ message: 'Role not found' });

        employee.role = roleId;
        await employee.save();

        logger.log(`Role '${role.name}' assigned to employee '${employee.name}'`);
        res.status(200).json({ message: `Role '${role.name}' assigned to employee '${employee.name}'` });
    } catch (error) {
        logger.error(`Failed to assign role: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all roles
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().select('-__v'); // Exclude __v
        res.status(200).json(roles);
    } catch (error) {
        logger.error(`Failed to fetch roles: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a role by ID
const getRoleById = async (req, res) => {
    try {
        const { roleId } = req.params;
        const role = await Role.findById(roleId);

        if (!role) return res.status(404).json({ message: 'Role not found' });

        res.status(200).json(role);
    } catch (error) {
        logger.error(`Failed to fetch role by ID: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get roles based on permissions
const getRolesByPermission = async (req, res) => {
    try {
        const { permission } = req.query;
        const roles = await Role.find({ permissions: permission });

        if (!roles.length) {
            return res.status(404).json({ message: `No roles found with permission '${permission}'` });
        }

        res.status(200).json(roles);
    } catch (error) {
        logger.error(`Failed to fetch roles by permission: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a role by ID
const updateRoleById = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { name, permissions } = req.body;

        const role = await Role.findById(roleId);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        if (name) role.name = name;
        if (permissions) role.permissions = permissions;

        await role.save();

        logger.log(`Role '${role.name}' updated successfully`);
        res.status(200).json({ message: `Role '${role.name}' updated successfully`, role });
    } catch (error) {
        logger.error(`Failed to update role: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all unique permissions across roles
const getAllPermissions = async (req, res) => {
    try {
        const roles = await Role.find({}, 'permissions');
        const allPermissions = [...new Set(roles.flatMap(role => role.permissions))];

        res.status(200).json({ permissions: allPermissions });
    } catch (error) {
        logger.error(`Failed to fetch permissions: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Push a temporary permission (LIFO stack behavior)
const pushTemporaryPermission = async (req, res) => {
    try {
        const { roleId, permission } = req.body;

        const role = await Role.findByIdAndUpdate(
            roleId,
            { $push: { temporaryPermission: permission } },
            { new: true }
        );

        if (!role) return res.status(404).json({ message: 'Role not found' });

        logger.log(`Temporary permission '${permission}' added to role '${role.name}'`);
        res.status(200).json({ message: `Temporary permission '${permission}' added`, role });
    } catch (error) {
        logger.error(`Failed to push temporary permission: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Pop a temporary permission (LIFO stack behavior)
const popTemporaryPermission = async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await Role.findById(roleId);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        const removedPermission = role.temporaryPermission.pop();
        await role.save();

        logger.log(`Temporary permission '${removedPermission}' removed from role '${role.name}'`);
        res.status(200).json({ message: `Temporary permission '${removedPermission}' removed`, role });
    } catch (error) {
        logger.error(`Failed to pop temporary permission: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Remove a role by ID
const deleteRoleById = async (req, res) => {
    try {
        const { roleId } = req.params;
        const role = await Role.findByIdAndDelete(roleId);

        if (!role) return res.status(404).json({ message: 'Role not found' });

        logger.log(`Role '${role.name}' deleted successfully`);
        res.status(200).json({ message: `Role '${role.name}' deleted successfully` });
    } catch (error) {
        logger.error(`Failed to delete role: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createRole,
    assignRoleToEmployee,
    getRoles,
    getRoleById,
    getRolesByPermission,
    updateRoleById,
    getAllPermissions,
    pushTemporaryPermission,
    popTemporaryPermission,
    deleteRoleById
};
