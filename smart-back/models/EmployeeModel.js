const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true,
        default: Date.now
    },
    userId: {
        type: String,
        required: true
    },
    hired_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    post: {
        type: String,
        required: true,
        default: "Clerk"
    },
    role: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Role model
        ref: 'Role',
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
    // Array of supervisees, referencing Employee model
    supervisees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' 
    }],
    agreed_basic: {
        type: Number,
        required: true,
        default: 0
    },
    re_allowance: {
        type: Number,
        required: true,
        default: 0
    },
    single_ot: {
        type: Number,
        required: true,
        default: 0
    },
    double_ot: {
        type: Number,
        required: true,
        default: 0
    },
    meal_allowance: {
        type: Number,
        required: true,
        default: 0
    },
    
}, {
    timestamps: true
});

// Pre-save hook to hash the password with salt
employeeSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to generate JWT token
employeeSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: '15d' }
    );
    return token;
};

// Method to check password validity
employeeSchema.methods.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
