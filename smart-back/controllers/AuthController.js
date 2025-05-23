const Employee = require('../models/EmployeeModel');
const Role = require('../models/RoleModel');
const logger = require('../utils/Logger');

// Login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await Employee.findOne({ email });
        if (!user || !(await user.checkPassword(password))) {
            logger.error(`Login failed for email: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if the user's password is expired (4 months validity)
        if (user.isPasswordExpired()) {
            logger.error(`Password expired for email: ${email}`);
            return res.status(403).json({ message: 'Password expired. Please update your password.' });
        }

        // Generate JWT token
        const token = user.generateAuthToken();

        // Set the token as an HTTP-only cookie with proper cross-domain settings
        res.cookie('auth_token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // Allow cross-site cookies in production
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
            path: '/' // Ensure cookie is sent with all requests
        });

        logger.log(`User logged in: ${user.email}`);

        const role = await Role.findById(user.role);

        // Also return the token in the response body for client-side storage alternative
        res.status(200).json({ 
            id: user._id,
            name: user.name,
            role: role.name,
            avatar: user?.avatar,
            userId: user.userId,
            token: token // Include token in response
        });
    } catch (error) {
        logger.error(`Login error for email ${req.body.email}: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout controller
const logout = (req, res) => {
    try {
        res.clearCookie('auth_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'
        });

        logger.log(`User logged out: ${req.user?.email || 'unknown'}`);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        logger.error(`Logout error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update password controller
const updatePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        // Check if user exists
        const user = await Employee.findOne({ email });
        if (!user) {
            logger.error(`Password update failed, user not found: ${email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        if (!(await user.checkPassword(currentPassword))) {
            logger.error(`Incorrect current password for email: ${email}`);
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password and save
        user.password = newPassword; // The pre-save hook will hash it
        await user.save();

        logger.log(`Password updated for email: ${user.email}`);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        logger.error(`Error updating password for email ${req.body.email}: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { login, logout, updatePassword };