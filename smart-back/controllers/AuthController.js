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
        logger.log(`User logged in: ${user.email}`);
        res.status(200).json({ token });
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};


const logout = (req, res) => {
    try {
        localStorage.removeItem('token');
        
        logger.log(`User logged out: ${req.user.email}`);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        logger.error(`Logout error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login, logout };
