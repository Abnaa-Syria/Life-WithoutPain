const router = require('express').Router();
const { authenticate } = require('../../middlewares/auth');
const { requirePermission } = require('../../middlewares/requirePermission');
const { guard, SUPER } = require('../admin/admin.permissions');
const RbacController = require('./rbac.controller');

router.use(authenticate);

router.get('/roles', guard('roles.manage', ...SUPER), RbacController.listRoles);
router.get('/roles/assignable', guard('roles.manage', ...SUPER), RbacController.listAssignableRoles);
router.get('/roles/:id', guard('roles.manage', ...SUPER), RbacController.getRole);
router.post('/roles', requirePermission('roles.manage'), RbacController.createRole);
router.put('/roles/:id', requirePermission('roles.manage'), RbacController.updateRole);
router.delete('/roles/:id', requirePermission('roles.manage'), RbacController.deleteRole);
router.put('/roles/:id/permissions', requirePermission('roles.manage'), RbacController.setRolePermissions);

router.get('/permissions', guard('roles.manage', ...SUPER), RbacController.listPermissions);

router.patch('/users/:userId/role', requirePermission('roles.manage'), RbacController.assignUserRole);
router.put('/users/:userId/permissions', requirePermission('roles.manage'), RbacController.setUserPermissions);

module.exports = router;
