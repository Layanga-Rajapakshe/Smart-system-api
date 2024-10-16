const Employee = require('../models/EmployeeModel');
const Role = require('../models/RoleModel');
const logger = require('../utils/Logger');

// Helper function to check permissions
const hasPermission = (role, requiredPermission) => {
    return role.permissions.includes(requiredPermission);
};

// Fetch all employees
const getEmployees = async (req, res) => {
    try {
        const role = await Role.findById(req.user.role);

        if (!hasPermission(role, 'view_employee_details')) {
            logger.error(`Unauthorized access attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to view employees.' });
        }

        // Assuming 'company' is a field in your Employee model
        const employees = await Employee.find({ company: req.user.company });
        logger.log(`Employees fetched for company: ${req.user.company}`);
        res.status(200).json(employees);
    } catch (error) {
        logger.error(`Failed to fetch employees: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

const getEmployee = async (req, res) => {
    try {
        const role = await Role.findById(req.user.role);
        const { id } = req.params;

        // Allow users to view their own details even without 'view_employee_details' permission
        if (req.user._id.toString() !== id && !hasPermission(role, 'view_employee_details')) {
            logger.error(`Unauthorized access attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to view employee details.' });
        }

        const employee = await Employee.findById(id);

        if (!employee || (employee.company && employee.company.toString() !== req.user.company.toString())) {
            logger.error(`Employee not found or does not belong to the company: ${id}`);
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        logger.log(`Employee fetched: ${employee.email}`);
        res.status(200).json(employee);
    } catch (error) {
        logger.error(`Failed to fetch employee: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};


const createEmployee = async (req, res) => {
    try {
        const role = await Role.findById(req.user.role);

        if (!hasPermission(role, 'create_employee')) {
            logger.error(`Unauthorized employee creation attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to create employees.' });
        }

        const employee = new Employee({
            ...req.body,
            company: req.user.company,
            createdBy: req.user._id
        });

        await employee.save();
        logger.log(`Employee created: ${employee._id}`);
        res.status(201).json(employee);
    } catch (error) {
        logger.error(`Failed to create employee: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};


const updateEmployee = async (req, res) => {
    try {
        const role = await Role.findById(req.user.role);
        const { id } = req.params;

        // Allow users to update their own details even without 'update_employee' permission
        if (req.user._id.toString() !== id && !hasPermission(role, 'update_employee')) {
            logger.error(`Unauthorized employee update attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to update employees.' });
        }

        const employee = await Employee.findById(id);

        if (!employee || (employee.company && employee.company.toString() !== req.user.company.toString())) {
            logger.error(`Employee not found or does not belong to the company: ${id}`);
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        // Allow only specific fields to be updated if the employee is updating their own details
        if (req.user._id.toString() === id) {
            const allowedFields = ['name', 'email', 'birthday', 'avatar','password']; // example fields users can update
            Object.keys(req.body).forEach(field => {
                if (allowedFields.includes(field)) {
                    employee[field] = req.body[field];
                }
            });
        } else {
            Object.assign(employee, req.body);
        }

        await employee.save();
        logger.log(`Employee updated: ${employee._id}`);
        res.status(200).json(employee);
    } catch (error) {
        logger.error(`Failed to update employee: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};


const deleteEmployee = async (req, res) => {
    try {
        const role = await Role.findById(req.user.role);

        if (!hasPermission(role, 'delete_employee')) {
            logger.error(`Unauthorized employee deletion attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to delete employees.' });
        }

        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee || (employee.company && employee.company.toString() !== req.user.company.toString())) {
            logger.error(`Employee not found or does not belong to the company: ${id}`);
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        await employee.remove();
        logger.log(`Employee deleted: ${employee._id}`);
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        logger.error(`Failed to delete employee: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
