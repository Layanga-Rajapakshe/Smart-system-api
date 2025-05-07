const express = require('express');
const { createKPIParameter,addParameterToSection ,updateKPIParameter, getAllKPIParameters,deleteKPIParameter} = require('../controllers/KPIparameterController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');

const router = express.Router();

// Add KPI parameter (only CEO)
router.post('/', createKPIParameter);
router.patch('/:id/:sectionName', addParameterToSection);


// Update KPI parameter (only CEO)
router.put('/kpi-parameters/:id', updateKPIParameter);
router.get('/kpi-parameters', getAllKPIParameters);
router.delete('/kpi-parameters/:id', deleteKPIParameter);

module.exports = router;
