const mongoose = require("mongoose");

const RequestTypeschema = new mongoose.Schema(
  {
    requestType: {
        type: String,
        enum: ['leave', 'expense', 'shift_change', 'promotion', 'other'],
        required: true,
        // The type of request (leave, expense, shift change, etc.)
    },
    hierarchyLevelRequired: {
        type: Number,
        required: true,
        // The minimum hierarchy level required to approve the request (higher-level employees only)
    },
  },
  {
    timestamps: true, 
  }
);

const RequestType = mongoose.model("Project", RequestTypeschema);

module.exports = RequestType;