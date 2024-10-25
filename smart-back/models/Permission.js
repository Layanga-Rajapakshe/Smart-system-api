const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
    requestType: {
        type: String,
        enum: ['leave', 'expense', 'shift_change', 'promotion', 'other'],
        required: true,
        // The type of request (leave, expense, shift change, etc.)
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        // The employee making the request
    },
    details: {
        type: String,
        required: true,
        // Additional details about the request (e.g., reason for leave, purpose of expense, etc.)
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        // The status of the request
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        // The employee who approves or rejects the request
    },
    hierarchyLevelRequired: {
        type: Number,
        required: true,
        // The minimum hierarchy level required to approve the request (higher-level employees only)
    },
    requestDate: {
        type: Date,
        default: Date.now,
        // The date when the request was made
    },
    approvalDate: {
        type: Date,
        // The date when the request was approved or rejected
    },
    additionalInfo: {
        type: mongoose.Schema.Types.Mixed,
        // Optional additional info depending on the request type (e.g., dates for leave, amount for expense)
    }
}, {
    timestamps: true
});

const Request = mongoose.model("Request", RequestSchema);
module.exports = Request;
