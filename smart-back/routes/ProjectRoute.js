const express = require("express");
const router = express.Router();
const {  createProject,getAllProjects,getProjectById,updateProject,deleteProject} = require("../controllers/ProjectController");
const checkPermissionMiddleware = require('../middleware/CheckPermission');
const authenticateUser = require('../middleware/AuthenticateUser');

// Routes for the Project model
router.post("/",authenticateUser, createProject); // Create a new project
router.get("/",authenticateUser, getAllProjects); // Get all projects
router.get("/:id",authenticateUser, getProjectById); // Get project by ID
router.put("/:id",authenticateUser, updateProject); // Update a project
router.delete("/:id",authenticateUser, deleteProject); // Delete a project

module.exports = router;
