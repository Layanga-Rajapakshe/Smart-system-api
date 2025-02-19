const express = require("express");
const {
  createRequestType,
  getAllRequestTypes,
  getRequestTypeById,
  updateRequestType,
  deleteRequestType,
} = require("../controllers/RequestTypeController");

const router = express.Router();

router.post("/", createRequestType);
router.get("/", getAllRequestTypes);
router.get("/:id", getRequestTypeById);
router.put("/:id", updateRequestType);
router.delete("/:id", deleteRequestType);

module.exports = router;
