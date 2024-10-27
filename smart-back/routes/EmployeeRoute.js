const express = require('express');
const router = express.Router();
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee,getEmployeeWithKPIs } = require('../controllers/EmployeeController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');
const authenticateUser = require('../middleware/AuthenticateUser');


router.get('/', authenticateUser, checkPermissionMiddleware('view_employee_details'), getEmployees);
router.get('/:id', authenticateUser, checkPermissionMiddleware('view_employee_details'), getEmployee);
router.post('/',authenticateUser,checkPermissionMiddleware('create_employees'), createEmployee);
router.put('/:id', authenticateUser, checkPermissionMiddleware('update_employee'), updateEmployee);
router.delete('/:id', authenticateUser, checkPermissionMiddleware('delete_employee'), deleteEmployee);
router.get('/kpi',authenticateUser,getEmployeeWithKPIs)
module.exports = router;

