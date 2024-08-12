const express = require('express');
const router = express.Router();
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/EmployeeController');
const authenticateUser = require('../middleware/AuthenticateUser');


router.get('/', authenticateUser, getEmployees);
router.get('/:id', authenticateUser, getEmployee);
router.post('/',authenticateUser, createEmployee);
router.put('/:id', authenticateUser, updateEmployee);
router.delete('/:id', authenticateUser, deleteEmployee);

module.exports = router;
