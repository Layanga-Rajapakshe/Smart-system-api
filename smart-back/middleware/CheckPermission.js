const Employee = require('../models/EmployeeModel');

const checkPermissionMiddleware = (action) => {
    return async (req, res, next) => {
        try {
            const employee = await Employee.findById(req.user._id).populate('role');
            const role = employee.role;

            if (!role.permissions.includes(action)) {
                return res.status(403).json({ message: `You do not have permission to ${action}` });
            }

            next();
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    };
};

module.exports = checkPermissionMiddleware;
