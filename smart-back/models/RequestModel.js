const mongoose = require("mongoose");

const RequestTypeSchema = new mongoose.Schema(
  {
    requestType: {
      type: String,
      required: true,
      unique: true, 
    },
    permission: {
      type: String,
      required: true,
      enum: [
        "create_employee",
        "create_role",
        "assign_role",
        "update_role",
        "get_roles_permission",
        "view_employee_details",
        "update_employee",
        "delete_employee",
        "manage_companies",
        "create_employees",
        "assign_roles",
        "manage_company_financials",
        "access_employee_salary_details",
        "generate_reports",
        "approve_budget",
        "send_company_messages",
        "manage_circulars",
        "create_meeting",
        "update_meeting"
      ],
    },
  },
  {
    timestamps: true,
  }
);

const RequestType = mongoose.model("RequestType", RequestTypeSchema);

module.exports = RequestType;
