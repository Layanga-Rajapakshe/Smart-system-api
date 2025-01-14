const mongoose = require("mongoose");


const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true
    },
    projectId: {
      type: String,
      required: true, 
      unique: true,
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Employee",                          
      required: true, 
    },
  },
  {
    timestamps: true, 
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
