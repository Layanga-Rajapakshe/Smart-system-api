const express = require("express");
const router = express.Router();
const {  createProject,getAllProjects,getProjectById,updateProject,deleteProject} = require("../controllers/ProjectController");

// Routes for the Project model
router.post("/", createProject); // Create a new project
router.get("/", getAllProjects); // Get all projects
router.get("/:id", getProjectById); // Get project by ID
router.put("/:id", updateProject); // Update a project
router.delete("/:id", deleteProject); // Delete a project

module.exports = router;
