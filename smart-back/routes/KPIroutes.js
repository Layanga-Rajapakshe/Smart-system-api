const express = require('express');
const { createKPI, getEmployeeKPIs, updateKPI,deleteKPI } = require('../controllers/KPIController');
const {authenticateUser} = require('../middleware/AuthenticateUser');


const router = express.Router();

// Create KPI for an employee
router.post('/create', createKPI);

// Get all KPIs for an employee
router.get('/:employeeId', authenticateUser, getEmployeeKPIs);

// Update KPI record
router.put('/:id', authenticateUser, updateKPI);

router.delete('/:id', authenticateUser, deleteKPI);

module.exports = router;
