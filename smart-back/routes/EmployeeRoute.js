const express = require('express');
const router = express.Router();
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee,getEmployeeWithKPIs,getEmployeeRole } = require('../controllers/EmployeeController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');
const authenticateUser = require('../middleware/AuthenticateUser');



router.get('/', authenticateUser, checkPermissionMiddleware('view_employee_details'), getEmployees);
router.get('/:id', authenticateUser, getEmployee);
router.post('/',authenticateUser,checkPermissionMiddleware('create_employee'), createEmployee);
router.put('/:id', authenticateUser, checkPermissionMiddleware('update_employee'), updateEmployee);
router.delete('/:id', authenticateUser, checkPermissionMiddleware('delete_employee'), deleteEmployee);
router.get('/kpi',authenticateUser,getEmployeeWithKPIs);
router.get('/:employeeId/role', getEmployeeRole);

module.exports = router;

