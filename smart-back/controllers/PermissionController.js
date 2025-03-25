const express = require("express");
const Request = require("../models/Permission");
const RequestType = require("../models/RequestModel");
const Employee = require("../models/EmployeeModel");
const Role = require("../models/RoleModel");

// Create a new request
const createRequest = async (req, res) => {
    try {
        const { requestType, details, additionalInfo } = req.body;

        if (!requestType || !details) {
            return res.status(400).json({ error: "Request type and details are required" });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Validate request type
        const requestTypeExists = await RequestType.findById(requestType);
        if (!requestTypeExists) {
            return res.status(404).json({ error: "Invalid request type" });
        }

        const newRequest = new Request({
            requestType,
            requestedBy: req.user.id,
            details,
            additionalInfo,
        });

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({ error: "Failed to create request" });
    }
};

// Get all requests (for admin or approver)
const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find().populate("requestedBy approvedBy requestType");
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ error: "Failed to fetch requests" });
    }
};

// Get requests for the logged-in employee
const getMyRequests = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const myRequests = await Request.find({ requestedBy: req.user.id }).populate("requestType");
        res.status(200).json(myRequests);
    } catch (error) {
        console.error("Error fetching user requests:", error);
        res.status(500).json({ error: "Failed to fetch your requests" });
    }
};

// Approve or reject a request
const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const { id } = req.params; // Request ID

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const request = await Request.findById(id).populate("requestedBy requestType");

        if (!request) {
            return res.status(404).json({ error: "Request not found" });
        }

        const approver = await Employee.findById(req.user.id).populate("role");
        if (!approver || !approver.role) {
            return res.status(403).json({ error: "Approver not found or missing role" });
        }

        const requestTypeData = await RequestType.findById(request.requestType);
        if (!requestTypeData) {
            return res.status(404).json({ error: "Request type not found" });
        }

        // Check hierarchy level
        if (approver.hierarchyLevel < requestTypeData.hierarchyLevelRequired) {
            return res.status(403).json({ error: "Insufficient hierarchy level to approve this request" });
        }

        request.status = status;
        request.approvedBy = req.user.id;
        request.approvalDate = new Date();

        const updatedRequest = await request.save();

        // If request is approved, add the permission to temporaryPermission
        if (status === "approved") {
            const requester = await Employee.findById(request.requestedBy).populate("role");

            if (!requester || !requester.role) {
                return res.status(404).json({ error: "Requester not found or missing role" });
            }

            const role = await Role.findById(requester.role._id);
            if (!role) {
                return res.status(404).json({ error: "Role not found" });
            }

            // Ensure the permission is not already in the list
            if (!role.temporaryPermission.includes(requestTypeData.permission)) {
                role.temporaryPermission.push(requestTypeData.permission);
                await role.save();
            }
        }

        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ error: "Failed to update request status" });
    }
};

module.exports = { createRequest, getAllRequests, getMyRequests, updateRequestStatus };
