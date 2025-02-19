const express = require("express");
const RequestType = require("../models/RequestModel");

// Create a new request type
const createRequestType = async (req, res) => {
  try {
    const { requestType, hierarchyLevelRequired } = req.body;
    const newRequestType = new RequestType({ requestType, hierarchyLevelRequired });
    await newRequestType.save();
    res.status(201).json(newRequestType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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

// Delete a request type
const deleteRequestType = async (req, res) => {
  try {
    const deletedRequestType = await RequestType.findByIdAndDelete(req.params.id);
    if (!deletedRequestType) return res.status(404).json({ error: "Request type not found" });
    res.status(200).json({ message: "Request type deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRequestType,
  getAllRequestTypes,
  getRequestTypeById,
  updateRequestType,
  deleteRequestType,
};
