const Employee = require('../models/EmployeeModel');

const showSalaryParameters = async (req, res) => {
    try {
        const { company } = req.params;

        // Find all employees belonging to the given company
        const employees = await Employee.find({ company }); 

        if (!employees || employees.length === 0) {
            return res.status(404).json({ 
                message: `No employees found in company ${company}` 
            });
        }

        // Extract required fields from all employees
        const salaryParameters = employees.map(employee => ({
            userId:employee.userId,
            Name:employee.name,
            post:employee.post,
            agreed_basic: employee.agreed_basic,
            re_allowance: employee.re_allowance,
            single_ot: employee.single_ot,
            double_ot: employee.double_ot,
            meal_allowance: employee.meal_allowance,
        }));

        // Send response
        res.status(200).json({
            success: true,
            salaryParameters
        });
    } catch (error) {
        // Handle errors
        console.error('Error fetching salary parameters:', error.message);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching salary parameters',
            error: error.message,
        });
    }
};
const editSalaryParameters = async (req, res) => {
    try {
        const { userId, company, agreed_basic, re_allowance, single_ot, double_ot, meal_allowance } = req.body;

        // Find the employee based on userId and company
        const employee = await Employee.findOne({
            userID: userId,
            company: company
        });

        // If no employee is found
        if (!employee) {
            return res.status(404).json({ 
                message: `No employee found in company ${company} with userId ${userId}` 
            });
        }

        // Update the employee's salary parameters
        if (agreed_basic) employee.agreed_basic = agreed_basic;
        if (re_allowance) employee.re_allowance = re_allowance;
        if (single_ot) employee.single_ot = single_ot;
        if (double_ot) employee.double_ot = double_ot;
        if (meal_allowance) employee.meal_allowance = meal_allowance;

        // Save the updated employee document
        await employee.save();

        // Return success response
        res.status(200).json({
            success: true,
            message: "Employee salary parameters updated successfully",
            employee
        });
    } catch (error) {
        // Handle errors
        console.error('Error updating salary parameters:', error.message);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating salary parameters",
            error: error.message
        });
    }
};

module.exports =
{
    showSalaryParameters,editSalaryParameters

}