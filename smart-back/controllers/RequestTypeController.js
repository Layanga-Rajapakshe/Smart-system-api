const express = require("express");
const RequestType = require("../models/RequestModel");


// Get all request types
const getAllRequestTypes = async (req, res) => {
  try {
    const requestTypes = await RequestType.find();
    res.status(200).json(requestTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a request type by ID
const getRequestTypeById = async (req, res) => {
  try {
    const requestType = await RequestType.findById(req.params.id);
    if (!requestType) return res.status(404).json({ error: "Request type not found" });
    res.status(200).json(requestType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a request type
const updateRequestType = async (req, res) => {
  try {
    const updatedRequestType = await RequestType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRequestType) return res.status(404).json({ error: "Request type not found" });
    res.status(200).json(updatedRequestType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const createRequestType = async (req, res) => {
  try {
    const { permission } = req.body;

    if (!permission) {
      return res.status(400).json({ error: "Permission field is required" });
    }

    // Check if the request type already exists
    const existingRequestType = await RequestType.findOne({ permission });
    if (existingRequestType) {
      return res.status(400).json({ error: "Request type already exists" });
    }

    // Create a new request type
    const newRequestType = new RequestType({ permission });
    await newRequestType.save();

    res.status(201).json({ message: "Request type created successfully", requestType: newRequestType });
  } catch (error) {
    console.error("Error creating request type:", error);
    res.status(500).json({ error: "Failed to create request type" });
  }
};

// Delete a request type (Admin only)
const deleteRequestType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the request type exists
    const requestType = await RequestType.findById(id);
    if (!requestType) {
      return res.status(404).json({ error: "Request type not found" });
    }

    // Delete the request type
    await requestType.deleteOne();

    res.status(200).json({ message: "Request type deleted successfully" });
  } catch (error) {
    console.error("Error deleting request type:", error);
    res.status(500).json({ error: "Failed to delete request type" });
  }
};


module.exports = {
  createRequestType,
  getAllRequestTypes,
  getRequestTypeById,
  updateRequestType,
  deleteRequestType,
};
