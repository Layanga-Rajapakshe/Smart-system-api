const jwt = require('jsonwebtoken');
const Employee = require('../models/EmployeeModel');
const logger = require('../utils/Logger');

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Employee.findById(decoded._id);

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        logger.log(`User authenticated: ${user.email}`);
        next();
    } catch (error) {
        logger.error(`Authentication failed: ${error.message}`);
        res.status(401).json({ message: 'Please authenticate' });
    }
};

module.exports = authenticateUser;
