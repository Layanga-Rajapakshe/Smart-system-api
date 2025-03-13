const express = require('express');
const { createKPI, getEmployeeKPIs, updateKPI } = require('../controllers/KPIController');
const {authenticateUser} = require('../middleware/AuthenticateUser');


const router = express.Router();

// Create KPI for an employee
router.post('/create', authenticateUser, createKPI);

// Get all KPIs for an employee
router.get('/:employeeId', authenticateUser, getEmployeeKPIs);

// Update KPI record
router.put('/:id', authenticateUser, updateKPI);

module.exports = router;
