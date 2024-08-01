const mongoose = require('mongoose');

const CompaniesSchema = mongoose.Schema({
    c_name: {
        type: String,
        required: [true, "Please enter the Company name"]
    },
    address: {
        street: {
            type: String,
            required: [true, "Please enter the street name"]
        },
        number: {
            type: String, // Consider using String to accommodate any potential format
            required: [true, "Please enter the street number"]
        },
        lane: {
            type: String,
            required: [true, "Please enter the lane name"]
        }
    },
    p_number: {
        type: Number,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v.toString());
            },
            message: props => `${props.value} is not a valid 10 digit number!`
        },
        required: [true, "Please enter the phone number"]
    }
}, {
    timestamps: true
});

const Company = mongoose.model('Company', CompaniesSchema);
module.exports = Company;
