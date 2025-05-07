const express = require('express');
const { createKPIParameter, updateKPIParameter, getAllKPIParameters,deleteKPIParameter,addParametersToSection,getKPIParameterById} = require('../controllers/KPIparameterController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');

const router = express.Router();

// Add KPI parameter (only CEO)
router.post('/', createKPIParameter);



// Update KPI parameter (only CEO)
router.put('/kpi-parameters/:id', updateKPIParameter);
router.get('/kpi-parameters', getAllKPIParameters);
router.delete('/kpi-parameters/:id', deleteKPIParameter);
router.post('/kpi/:id/add-parameter', addParametersToSection);
router.get('/kpi/:id',getKPIParameterById);
module.exports = router;
