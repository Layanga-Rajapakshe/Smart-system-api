const express = require("express");
const router = express.Router();
const {createRequest, getAllRequests, getMyRequests, updateRequestStatus} = require("../controllers/PermissionController");


// Create a new request (for employees)
router.post("/", createRequest);

// Get all requests (for admin or higher-level employees)
router.get("/",getAllRequests);

// Get logged-in employee's own requests
router.get("/my-requests",getMyRequests);

// Update the status of a request (approve/reject)
router.put("/:id/status", updateRequestStatus);

module.exports = router;
