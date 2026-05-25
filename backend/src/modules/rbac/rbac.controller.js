const RbacService = require('./rbac.service');
const { successResponse, createdResponse } = require('../../shared/responses');

class RbacController {
  static async listRoles(req, res) {
    const data = await RbacService.listRoles();
    return successResponse(res, { data });
  }

  static async listAssignableRoles(req, res) {
    const data = await RbacService.listAssignableRoles();
    return successResponse(res, { data });
  }

  static async getRole(req, res) {
    const data = await RbacService.getRoleById(parseInt(req.params.id, 10));
    return successResponse(res, { data });
  }

  static async listPermissions(req, res) {
    const data = await RbacService.listPermissions();
    return successResponse(res, { data });
  }

  static async createRole(req, res) {
    const data = await RbacService.createRole(req.body, req.user.id, req);
    return createdResponse(res, { data });
  }

  static async updateRole(req, res) {
    const data = await RbacService.updateRole(parseInt(req.params.id, 10), req.body, req.user.id, req);
    return successResponse(res, { data });
  }

  static async deleteRole(req, res) {
    const data = await RbacService.deleteRole(parseInt(req.params.id, 10), req.user.id, req);
    return successResponse(res, { data });
  }

  static async setRolePermissions(req, res) {
    const { permissionIds } = req.body;
    const data = await RbacService.setRolePermissions(
      parseInt(req.params.id, 10),
      permissionIds || [],
      req.user.id,
      req,
    );
    return successResponse(res, { data });
  }

  static async assignUserRole(req, res) {
    const { role } = req.body;
    const data = await RbacService.assignUserRole(parseInt(req.params.userId, 10), role, req.user.id, req);
    return successResponse(res, { data });
  }

  static async setUserPermissions(req, res) {
    const data = await RbacService.setUserPermissionOverrides(
      parseInt(req.params.userId, 10),
      req.body.overrides || [],
      req.user.id,
      req,
    );
    return successResponse(res, { data });
  }
}

module.exports = RbacController;
