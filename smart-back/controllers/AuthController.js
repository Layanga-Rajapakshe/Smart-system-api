const Employee = require('../models/EmployeeModel');
const logger = require('../utils/Logger');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Employee.findOne({ email });

        if (!user || !(await user.checkPassword(password))) {
            logger.error(`Login failed for email: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateAuthToken();

        // Set the token as a cookie
        res.cookie('auth_token', token, {
            httpOnly: true, // Prevents access via JavaScript
            secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
            sameSite: 'strict', // Helps mitigate CSRF attacks
            maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days in milliseconds
        });

        logger.log(`User logged in: ${user.email}`);
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

const logout = (req, res) => {
    try {
        // Clear the auth_token cookie
        res.clearCookie('auth_token');

        logger.log(`User logged out: ${req.user.email}`);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        logger.error(`Logout error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login, logout };
