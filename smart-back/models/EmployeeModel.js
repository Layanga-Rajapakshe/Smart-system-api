const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Employee', 'Manager', 'CEO'],
        default: 'Employee'
    },
    team: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    age: {
        type: Number,
        required: true
    },
    avatar: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    }
}, {
    timestamps: true
});


employeeSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to generate JWT token
employeeSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, role: this.role, company: this.company },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    return token;
};


employeeSchema.methods.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
