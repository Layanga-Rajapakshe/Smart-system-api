// models/PermissionRequest.js
const mongoose = require("mongoose");

const PermissionRequestSchema = new mongoose.Schema({
    permission: {
        type: String,
        required: true,
        enum: [
            "create_employee",
            "create_role",
            "assign_role",
            "update_role",
            "get_roles_permission",
            "view_employee_details",
            "update_employee",
            "delete_employee",
            "manage_companies",
            "create_employees",
            "assign_roles",
            "manage_company_financials",
            "access_employee_salary_details",
            "generate_reports",
            "approve_budget",
            "send_company_messages",
            "manage_circulars",
            "create_meeting",
            "update_meeting"
        ],
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    details: {
        type: String,
        required: true,
        // Reason for requesting this permission
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
    },
    requestDate: {
        type: Date,
        default: Date.now,
    },
    approvalDate: {
        type: Date,
    },
    expiryDate: {
        type: Date,
        // Optional: When this permission should expire if temporary
    },
    additionalInfo: {
        type: mongoose.Schema.Types.Mixed,
        // Any additional info required for the request
    }
}, {
    timestamps: true
});

const PermissionRequest = mongoose.model("PermissionRequest", PermissionRequestSchema);
module.exports = PermissionRequest;