const express = require("express");
const RequestType = require("../models/RequestModel");

// Create a new request type
const createRequestType = async (req, res) => {
  try {
    const { requestType, permission } = req.body;
    const newRequestType = new RequestType({ requestType, permission });
    await newRequestType.save();
    res.status(201).json({ message: "Request type created successfully", requestType: newRequestType });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all request types
const getAllRequestTypes = async (req, res) => {
  try {
    const requestTypes = await RequestType.find();
    res.status(200).json(requestTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single request type by ID
const getRequestTypeById = async (req, res) => {
  try {
    const requestType = await RequestType.findById(req.params.id);
    if (!requestType) {
      return res.status(404).json({ message: "Request type not found" });
    }
    res.status(200).json(requestType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a request type by ID
const updateRequestType = async (req, res) => {
  try {
    const { requestType, permission } = req.body;
    const updatedRequestType = await RequestType.findByIdAndUpdate(
      req.params.id,
      { requestType, permission },
      { new: true, runValidators: true }
    );
    if (!updatedRequestType) {
      return res.status(404).json({ message: "Request type not found" });
    }
    res.status(200).json({ message: "Request type updated successfully", requestType: updatedRequestType });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a request type by ID
const deleteRequestType = async (req, res) => {
  try {
    const deletedRequestType = await RequestType.findByIdAndDelete(req.params.id);
    if (!deletedRequestType) {
      return res.status(404).json({ message: "Request type not found" });
    }
    res.status(200).json({ message: "Request type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports={
  createRequestType,
  getAllRequestTypes,
  getRequestTypeById,
  updateRequestType,
  deleteRequestType
};
