const express = require("express");
const Request = require("../models/Request");
const Employee = require("../models/Employee");

// Create a new request
const createRequest = async (req, res) => {
    try {
        const { requestType, details, additionalInfo } = req.body;

        const newRequest = new Request({
            requestType,
            requestedBy: req.user.id, // Assuming `req.user.id` contains the logged-in user's ID
            details,
            additionalInfo,
        });

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        res.status(500).json({ error: "Failed to create request" });
    }
};

// Get all requests (for admin or approver)
const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find().populate("requestedBy approvedBy requestType");
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch requests" });
    }
};

// Get employee-specific requests
const getMyRequests = async (req, res) => {
    try {
        const myRequests = await Request.find({ requestedBy: req.user.id }).populate("requestType");
        res.status(200).json(myRequests);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch your requests" });
    }
};

// Approve or reject a request
const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const { id } = req.params; // Request ID

        const request = await Request.findById(id).populate("requestedBy approvedBy requestType");

        if (!request) {
            return res.status(404).json({ error: "Request not found" });
        }

        const approver = await Employee.findById(req.user.id); // Fetch the approver

        if (!approver) {
            return res.status(403).json({ error: "Approver not found" });
        }

        const requestTypeData = await RequestType.findById(request.requestType);
        if (!requestTypeData) {
            return res.status(404).json({ error: "Request type not found" });
        }

        if (approver.hierarchyLevel < requestTypeData.hierarchyLevelRequired) {
            return res.status(403).json({ error: "Insufficient hierarchy level to approve this request" });
        }

        request.status = status;
        request.approvedBy = req.user.id; // Logged-in approver
        request.approvalDate = Date.now();

        const updatedRequest = await request.save();
        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: "Failed to update request status" });
    }
};

module.exports = { createRequest, getAllRequests, getMyRequests, updateRequestStatus };
