const Employee = require('../models/EmployeeModel');

const getEmployees = async (req, res) => {
    try {
        if (req.user.role !== 'CEO') {
            return res.status(403).json({ message: 'Only CEOs can view employees.' });
        }

        const employees = await Employee.find({ company: req.user.company });
        res.status(200).json(employees);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

const getEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'CEO') {
            return res.status(403).json({ message: 'Only CEOs can view employee details.' });
        }

        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee || employee.company.toString() !== req.user.company.toString()) {
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        res.status(200).json(employee);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

const createEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'CEO') {
            return res.status(403).json({ message: 'Only CEOs can create employees.' });
        }

        const employee = new Employee({
            ...req.body,
            company: req.user.company,
            createdBy: req.user._id
        });

        await employee.save();
        res.status(201).json(employee);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

const updateEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'CEO') {
            return res.status(403).json({ message: 'Only CEOs can update employees.' });
        }

        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee || employee.company.toString() !== req.user.company.toString()) {
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        Object.assign(employee, req.body);
        await employee.save();
        res.status(200).json(employee);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

const deleteEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'CEO') {
            return res.status(403).json({ message: 'Only CEOs can delete employees.' });
        }

        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee || employee.company.toString() !== req.user.company.toString()) {
            return res.status(404).json({ message: `Employee not found with id ${id}` });
        }

        await employee.remove();
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
}
