const express = require('express');
const { createKPIParameter, updateKPIParameter, getAllKPIParameters,deleteKPIParameter} = require('../controllers/KPIparameterController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');

const router = express.Router();

// Add KPI parameter (only CEO)
router.post('/kpi-parameters', checkPermissionMiddleware('add_parameters'), createKPIParameter);

// Update KPI parameter (only CEO)
router.put('/kpi-parameters/:id', checkPermissionMiddleware('update_parameters'), updateKPIParameter);
router.get('/kpi-parameters', getAllKPIParameters);
router.delete('/kpi-parameters/:id', checkPermissionMiddleware('delete_parameters'), deleteKPIParameter);

module.exports = router;
