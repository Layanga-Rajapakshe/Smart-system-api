const Employee = require('../models/EmployeeModel');
const Role = require('../models/RoleModel');

const showSalaryParameters = async (req, res) => {
    try {
        const { roleName } = req.params; // Expecting role name as a parameter
        //const { companyId } = req.query; // Expecting company ID as a query parameter

       

        // Find the role by name
        const role = await Role.findOne({ name: roleName });
        if (!role) {
            return res.status(404).json({
                success: false,
                message: `Role '${roleName}' not found`,
            });
        }

        // Find employees with the given role ID and company ID
        const employees = await Employee.find({ role: role._id,  status: 'active' })
            .populate('role', 'name') // Populate role name
            .populate('company', 'name'); // Populate company name

        if (!employees || employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No active employees found for role '${roleName}' in the given company`,
            });
        }

        // Extract required fields from all employees
        const salaryParameters = employees.map(employee => ({
            userId: employee.userId,
            name: employee.name,
            post: employee.post,
            role: employee.role.name,
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
        const { userId, agreed_basic, re_allowance, single_ot, double_ot, meal_allowance } = req.body;

        
        // Find the employee based on userId and company
        const employee = await Employee.findOne({
            userId: userId,
        });

        // If no employee is found
        if (!employee) {
            return res.status(404).json({ 
                success: false,
                message: `No employee found in company ${companyId} with userId ${userId}` 
            });
        }

        // Update the employee's salary parameters
        if (agreed_basic !== undefined) employee.agreed_basic = agreed_basic;
        if (re_allowance !== undefined) employee.re_allowance = re_allowance;
        if (single_ot !== undefined) employee.single_ot = single_ot;
        if (double_ot !== undefined) employee.double_ot = double_ot;
        if (meal_allowance !== undefined) employee.meal_allowance = meal_allowance;

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