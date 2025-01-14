const Project = require("../models/ProjectModel");

// Create a new project
const createProject = async (req, res) => {
  try {
    const { projectName, projectId, projectManager } = req.body;

    if (!projectName || !projectId || !projectManager) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newProject = new Project({
      projectName,
      projectId,
      projectManager,
    });

    await newProject.save();

    res.status(201).json({
      message: "Project created successfully.",
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create project.", error: error.message });
  }
};

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("projectManager", "name email");

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve projects", error: error.message });
  }
};

// Get a project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).populate("projectManager", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve project", error: error.message });
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    Object.assign(project, updatedData);
    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update project", error: error.message });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
