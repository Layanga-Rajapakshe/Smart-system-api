const express = require('express');
const { createRole, assignRoleToEmployee, getRoles, getRolesByPermission,updateRoleById,getRoleById, getAllPermissions } = require('../controllers/RoleController');
const checkPermissionMiddleware = require('../middleware/CheckPermission');
const {authenticateUser} = require('../middleware/AuthenticateUser');

const router = express.Router();


router.post('/create',authenticateUser,checkPermissionMiddleware('create_role'), createRole);

router.post('/assign',authenticateUser, checkPermissionMiddleware('assign_role'), assignRoleToEmployee);

router.get('/',authenticateUser,getRoles);

router.get('/by-permission',authenticateUser,checkPermissionMiddleware('get_roles_permission'), getRolesByPermission);

router.patch('/:roleId',authenticateUser,checkPermissionMiddleware('update_role'),updateRoleById);
router.get('/permissonlist', getAllPermissions);
router.get('/:roleId', authenticateUser,  getRoleById);

module.exports = router;
