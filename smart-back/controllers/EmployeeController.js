const Employee = require('../models/EmployeeModel');
const logger = require('../utils/Logger');

const getEmployees = async (req, res) => {
    try {
        //if (req.user.role !== 'CEO') {
        //    logger.error(`Unauthorized access attempt by: ${req.user.email}`);
        //    return res.status(403).json({ message: 'Only CEOs can view employees.' });
        //}

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
        if (req.user.role !== 'CEO') {
            logger.error(`Unauthorized access attempt by: ${req.user.email}`);
            return res.status(403).json({ message: 'Only CEOs can view employee details.' });
        }

        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee || employee.company.toString() !== req.user.company.toString()) {
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
       // if (req.user.role !== 'CEO') {
        //    logger.error(`Unauthorized employee creation attempt by: ${req.user.email}`);
        //    return res.status(403).json({ message: 'Only CEOs can create employees.' });
        //}

        const employee = new Employee({
            ...req.body,
            company: req.user.company,
            createdBy: req.user._id
        });

        await employee.save();
        logger.log(`Employee created: ${employee.email}`);
        res.status(201).json(employee);
    } catch (error) {
        logger.error(`Failed to create employee: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

const updateEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'CEO') {
            logger.error(`Unauthorized employee update attempt by: ${req.user.email}`);
            return res.status(403).json({ message: 'Only CEOs can update employees.' });
        }

        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee || employee.company.toString() !== req.user.company.toString()) {
            logger.error(`Employee not found or does not belong to the company: ${id}`);
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        Object.assign(employee, req.body);
        await employee.save();
        logger.log(`Employee updated: ${employee.email}`);
        res.status(200).json(employee);
    } catch (error) {
        logger.error(`Failed to update employee: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'CEO') {
            logger.error(`Unauthorized employee deletion attempt by: ${req.user.email}`);
            return res.status(403).json({ message: 'Only CEOs can delete employees.' });
        }

        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee || employee.company.toString() !== req.user.company.toString()) {
            logger.error(`Employee not found or does not belong to the company: ${id}`);
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        await employee.remove();
        logger.log(`Employee deleted: ${employee.email}`);
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
