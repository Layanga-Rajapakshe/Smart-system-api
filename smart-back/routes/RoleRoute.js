const express = require('express');
const { createRole, assignRoleToEmployee, getRoles, getRolesByPermission } = require('../controllers/RoleController');
const checkPermissionMiddleware = require('../middleware/checkPermissionMiddleware');

const router = express.Router();


router.post('/create', checkPermissionMiddleware('create_role'), createRole);

router.post('/assign', checkPermissionMiddleware('assign_role'), assignRoleToEmployee);

router.get('/', checkPermissionMiddleware('view_roles'), getRoles);

router.get('/by-permission', checkPermissionMiddleware('view_roles_by_permission'), getRolesByPermission);

module.exports = router;
