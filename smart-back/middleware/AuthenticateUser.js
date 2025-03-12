const jwt = require('jsonwebtoken');
const Employee = require('../models/EmployeeModel');
const logger = require('../utils/Logger');

const SUPER_ADMIN_ID = '66fbb15030e37b523885f5ad';

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Employee.findById(decoded._id).populate('company');

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user; // Attach user to request
        logger.log(`User authenticated: ${user.email}`);
        next();
    } catch (error) {
        logger.error(`Authentication failed: ${error.message}`);
        res.status(401).json({ message: 'Please authenticate' });
    }
};


const authorizeCompanyAccess = async (req, res, next) => {
    try {
        if (req.user._id.toString() === SUPER_ADMIN_ID) {
            return next(); // Super Admin has full access
        }

        
        const companyId = req.params.companyId || req.body.company; // Extract company ID from params or body

        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required' });
        }

        if (req.user.company._id.toString() === companyId.toString()) {
            return next(); // User belongs to the company, allow access
        }

        return res.status(403).json({ message: 'Access denied: Unauthorized company' });
    } catch (error) {
        logger.error(`Authorization error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { authenticateUser, authorizeCompanyAccess };
