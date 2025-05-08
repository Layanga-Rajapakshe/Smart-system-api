const express = require("express");
const router = express.Router();
const {createPermissionRequest,
    getAllPermissionRequests,
    getMyPermissionRequests,
    updatePermissionRequestStatus,
    getPermissionRequestById,
    updatePermissionRequest,
    deletePermissionRequest} = require("../controllers/PermissionController");


// Create a new request (for employees)
router.post("/", createPermissionRequest);

// Get all requests (for admin or higher-level employees)
router.get("/",getAllPermissionRequests);

// Get logged-in employee's own requests
router.get("/my-requests",getMyPermissionRequests);

// Update the status of a request (approve/reject)
router.put("/:id/status", updatePermissionRequestStatus);

router.delete("/:id", deletePermissionRequest);
router.get("/:id", getPermissionRequestById);
router.put("/:id", updatePermissionRequest);

module.exports = router;
