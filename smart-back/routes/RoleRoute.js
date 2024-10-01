const express = require('express');
const { createRole, assignRoleToEmployee, getRoles, getRolesByPermission,updateRoleById } = require('../controllers/RoleController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');

const router = express.Router();


router.post('/create',checkPermissionMiddleware('create_role'), createRole);

router.post('/assign', checkPermissionMiddleware('assign_role'), assignRoleToEmployee);

router.get('/',checkPermissionMiddleware('get_roles'), getRoles);

router.get('/by-permission',checkPermissionMiddleware('get_roles_permission'), getRolesByPermission);

router.put('/:roleId',checkPermissionMiddleware('update_role'),updateRoleById);

module.exports = router;
