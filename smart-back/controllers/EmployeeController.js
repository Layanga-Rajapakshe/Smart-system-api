const Employee = require('../models/EmployeeModel');
const Role = require('../models/RoleModel');
const Task = require('../models/TwoWeekModel');
const logger = require('../utils/Logger');


// Helper function to check permissions
const hasPermission = (role, requiredPermission) => {
    return role.permissions.includes(requiredPermission);
};

// Fetch all employees
const getEmployees = async (req, res) => {
    try {
        const role = await Role.findById(req.user.role);

       
        if (req.user.role.toString() === '66fbb15030e37b523885f5ad') {
            // Super Admin can view all employees across all companies
            const employees = await Employee.find({});
            logger.log(`Super Admin accessed all employee details.`);
            return res.status(200).json(employees);
        }

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
        if (req.user.role.toString() === '66fbb15030e37b523885f5ad') {
            const employees = await Employee.findById(id);
            logger.log(`Super Admin accessed all employee details.`);
            return res.status(200).json(employees);
        }

        const employee = await Employee.findById(id).populate('supervisor');

        if (!employee || (employee.company && employee.company.toString() !== req.user.company.toString())) {
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        const isSelf = req.user._id.toString() === id;
        const isSupervisor = employee.supervisor && employee.supervisor._id.toString() === req.user._id.toString();
        const hasPermission = role && role.permissions.includes('view_employee_details');

        // Allow access if the user is the employee, their supervisor, or has permission
        if (!isSelf && !isSupervisor && !hasPermission) {
            logger.error(`Unauthorized access attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to view employee details.' });
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
        const { supervisees, supervisor, ...employeeData } = req.body;

        // Create new employee
        const employee = new Employee({
            ...employeeData,
            createdBy: req.user._id
        });

        await employee.save();

        // If supervisees are provided, update their supervisor field
        if (supervisees && supervisees.length > 0) {
            await Employee.updateMany(
                { _id: { $in: supervisees } },
                { $set: { supervisor: employee._id } }
            );
        }

        // If a supervisor is assigned, update their supervisees list
        if (supervisor) {
            await Employee.findByIdAndUpdate(
                supervisor,
                { $addToSet: { supervisees: employee._id } } // Prevent duplicate entries
            );
        }

        logger.log(`Employee created: ${employee._id}`);
        res.status(201).json(employee);
    } catch (error) {
        logger.error(`Failed to create employee: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};



const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params; // Employee ID to update
        const { _id: userId, role: userRole, company: userCompany } = req.user; // Logged-in user's details

        // Fetch the user's role details
        const role = await Role.findById(userRole);
        if (!role) {
            return res.status(403).json({ message: 'Invalid user role.' });
        }

        // Check if employee exists
        const employee = await Employee.findById(id);
        if (!employee) {
            logger.error(`Employee not found with id: ${id}`);
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        // Super Admin logic (direct update access)
        if (userRole.toString() === '66fbb15030e37b523885f5ad') {
            const updatedEmployee = await Employee.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updatedEmployee) {
                logger.error(`Employee update failed for id: ${id}`);
                return res.status(400).json({ message: 'Failed to update employee.' });
            }
            logger.log(`Super Admin updated employee details: ${JSON.stringify(updatedEmployee)}`);
            return res.status(200).json(updatedEmployee);
        }

        // Check company association (employee must belong to the same company)
        if (employee.company && employee.company.toString() !== userCompany.toString()) {
            logger.error('Unauthorized access. Employee does not belong to the same company.');
            return res.status(403).json({ message: 'Employee does not belong to your company.' });
        }

        // Handle self-update (employees updating their own data)
        if (userId.toString() === id) {
            const allowedFields = ['name', 'email', 'birthday', 'avatar', 'password']; // Fields self-updatable
            Object.keys(req.body).forEach((field) => {
                if (allowedFields.includes(field)) {
                    employee[field] = req.body[field];
                }
            });
        } else {
            // Check if user has the 'update_employee' permission
            if (!hasPermission(role, 'update_employee')) {
                logger.error(`Unauthorized update attempt by user: ${userId}`);
                return res.status(403).json({ message: 'You do not have permission to update employees.' });
            }

            // Update fields (excluding restricted fields)
            const restrictedFields = ['company', 'role']; // Fields that cannot be updated
            Object.keys(req.body).forEach((field) => {
                if (!restrictedFields.includes(field)) {
                    employee[field] = req.body[field];
                }
            });
        }

        // Save updated employee
        const updatedEmployee = await employee.save();
        if (!updatedEmployee) {
            logger.error(`Failed to save updated employee for id: ${id}`);
            return res.status(500).json({ message: 'Failed to update employee.' });
        }

        // Log successful update
        logger.log(`Employee updated successfully: ${JSON.stringify(updatedEmployee)}`);
        res.status(200).json(updatedEmployee);
    } catch (error) {
        logger.error(`Failed to update employee: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
};


const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await Role.findById(req.user.role);
        if (req.user.role.toString() === '66fbb15030e37b523885f5ad') {
            // Super Admin can view all employees across all companies
            const employees = await Employee.findByIdAndDelete(id);
            logger.log(`Super Admin accessed all employee details.`);
            return res.status(200).json(employees);
        }

        if (!hasPermission(role, 'delete_employee')) {
            logger.error(`Unauthorized employee deletion attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to delete employees.' });
        }

        const employee = await Employee.findById(id);

        if (!employee || (employee.company && employee.company.toString() !== req.user.company.toString())) {
            logger.error(`Employee not found or does not belong to the company: ${id}`);
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        await employee.remove();
        
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        logger.error(`Failed to delete employee: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};
const getEmployeeWithKPIs = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);
        
        if (!employee || employee.company.toString() !== req.user.company.toString()) {
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }
        
        const kpis = await KPI.find({ employee: id });
        res.status(200).json({ employee, kpis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Controller to get employee role
const getEmployeeRole = async (req, res) => {
    try {
        const { employeeId } = req.params; // Assume employeeId is passed as a route parameter

        // Find the employee and populate the role
        const employee = await Employee.findById(employeeId).populate('role'); // Adjust the fields based on your Role model

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({
            message: 'Employee role retrieved successfully',
            role: employee.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const getSupervisees = async(req,res)=>{
    try {
        // Find the logged-in supervisor and populate supervisees
        const supervisor = await Employee.findById(req.user._id)
            .populate('supervisees', 'name email role');

        if (!supervisor) {
            return res.status(404).json({ message: 'Supervisor not found' });
        }

        res.status(200).json(supervisor.supervisees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const SuperviseeTasks = async (req,res)=>{
    try {
        const superviseeId = req.params.id;

        // Find supervisee and also get their supervisees
        const supervisee = await Employee.findById(superviseeId)
            .populate('supervisees', 'name email role');

        if (!supervisee) {
            return res.status(404).json({ message: 'Supervisee not found' });
        }

        // Fetch tasks of the selected supervisee
        const tasks = await Task.find({ UserId: superviseeId });

        res.status(200).json({
            supervisee,
            tasks
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}





module.exports = {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeWithKPIs,
    getEmployeeRole,
    getSupervisees,
    SuperviseeTasks
};
