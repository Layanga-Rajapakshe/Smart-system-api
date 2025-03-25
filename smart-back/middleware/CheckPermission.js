const Employee = require('../models/EmployeeModel');

const checkPermissionMiddleware = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const employee = await Employee.findById(req.user._id).populate('role');
            if (!employee || !employee.role) {
                return res.status(403).json({ message: "Role not found." });
            }
            
            const { permissions, temporaryPermission } = employee.role;

            if (permissions.includes(requiredPermission) || temporaryPermission.includes(requiredPermission)) {
                return next(); 
            }

            return res.status(403).json({ message: `You do not have permission to ${requiredPermission}` });

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    };
};

module.exports = checkPermissionMiddleware;
