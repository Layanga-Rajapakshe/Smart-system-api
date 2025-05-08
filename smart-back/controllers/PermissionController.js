// controllers/permissionRequestController.js
const PermissionRequest = require("../models/Permission");
const Employee = require("../models/EmployeeModel");
const Role = require("../models/RoleModel");

// Create a new permission request
const createPermissionRequest = async (req, res) => {
    try {
        const { permission, details, additionalInfo, expiryDate } = req.body;

        if (!permission || !details) {
            return res.status(400).json({ error: "Permission and details are required" });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const newPermissionRequest = new PermissionRequest({
            permission,
            requestedBy: req.user.id,
            details,
            expiryDate: expiryDate || null,
            additionalInfo: additionalInfo || {},
        });

        const savedRequest = await newPermissionRequest.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        console.error("Error creating permission request:", error);
        res.status(500).json({ error: "Failed to create permission request" });
    }
};

// Get all permission requests (for admins/managers)
const getAllPermissionRequests = async (req, res) => {
    try {
        const requests = await PermissionRequest.find()
            .populate("requestedBy", "name email employeeId")
            .populate("approvedBy", "name email employeeId");
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching permission requests:", error);
        res.status(500).json({ error: "Failed to fetch permission requests" });
    }
};

// Get permission requests for the logged-in employee
const getMyPermissionRequests = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const myRequests = await PermissionRequest.find({ requestedBy: req.user.id });
        res.status(200).json(myRequests);
    } catch (error) {
        console.error("Error fetching user permission requests:", error);
        res.status(500).json({ error: "Failed to fetch your permission requests" });
    }
};

// Approve or reject a permission request
const updatePermissionRequestStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const { id } = req.params; // Request ID

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const request = await PermissionRequest.findById(id).populate("requestedBy");

        if (!request) {
            return res.status(404).json({ error: "Permission request not found" });
        }

        // Check if approver has permission to approve requests
        const approver = await Employee.findById(req.user.id).populate("role");
        if (!approver || !approver.role) {
            return res.status(403).json({ error: "Approver not found or missing role" });
        }

        // You can add additional checks here to ensure approver has the right to approve

        request.status = status;
        request.approvedBy = req.user.id;
        request.approvalDate = new Date();

        const updatedRequest = await request.save();

        // If request is approved, add the permission to the employee's role temporary permissions
        if (status === "approved") {
            const requester = await Employee.findById(request.requestedBy._id).populate("role");

            if (!requester || !requester.role) {
                return res.status(404).json({ error: "Requester not found or missing role" });
            }

            const role = await Role.findById(requester.role._id);
            if (!role) {
                return res.status(404).json({ error: "Role not found" });
            }

            // Ensure the permission is not already in the list
            if (!role.temporaryPermission.includes(request.permission)) {
                role.temporaryPermission.push(request.permission);
                await role.save();
            }
        }

        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error("Error updating permission request status:", error);
        res.status(500).json({ error: "Failed to update permission request status" });
    }
};

// Get a specific permission request by ID
const getPermissionRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await PermissionRequest.findById(id)
            .populate("requestedBy", "name email employeeId")
            .populate("approvedBy", "name email employeeId");
            
        if (!request) {
            return res.status(404).json({ error: "Permission request not found" });
        }
        
        res.status(200).json(request);
    } catch (error) {
        console.error("Error fetching permission request:", error);
        res.status(500).json({ error: "Failed to fetch permission request" });
    }
};

// Update a permission request (before approval)
const updatePermissionRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { details, additionalInfo, expiryDate } = req.body;
        
        const request = await PermissionRequest.findById(id);
        
        if (!request) {
            return res.status(404).json({ error: "Permission request not found" });
        }
        
        // Only the requester can update their request
        if (request.requestedBy.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to update this request" });
        }
        
        // Can't update if already approved/rejected
        if (request.status !== 'pending') {
            return res.status(400).json({ error: "Cannot update a request that has already been processed" });
        }
        
        if (details) request.details = details;
        if (additionalInfo) request.additionalInfo = additionalInfo;
        if (expiryDate) request.expiryDate = expiryDate;
        
        const updatedRequest = await request.save();
        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error("Error updating permission request:", error);
        res.status(500).json({ error: "Failed to update permission request" });
    }
};

// Delete a pending permission request
const deletePermissionRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await PermissionRequest.findById(id);
        
        if (!request) {
            return res.status(404).json({ error: "Permission request not found" });
        }
        
        // Only the requester can delete their pending request
        if (request.requestedBy.toString() !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to delete this request" });
        }
        
        // Can't delete if already approved/rejected
        if (request.status !== 'pending') {
            return res.status(400).json({ error: "Cannot delete a request that has already been processed" });
        }
        
        await PermissionRequest.findByIdAndDelete(id);
        res.status(200).json({ message: "Permission request deleted successfully" });
    } catch (error) {
        console.error("Error deleting permission request:", error);
        res.status(500).json({ error: "Failed to delete permission request" });
    }
};

module.exports = {
    createPermissionRequest,
    getAllPermissionRequests,
    getMyPermissionRequests,
    updatePermissionRequestStatus,
    getPermissionRequestById,
    updatePermissionRequest,
    deletePermissionRequest
};