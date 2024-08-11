const Employee = require('../models/EmployeeModel');


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Employee.findOne({ email });

        if (!user || !(await user.checkPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateAuthToken();
        res.status(200).json({ token });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login };
