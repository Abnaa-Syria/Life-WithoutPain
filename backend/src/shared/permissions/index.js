const { PERMISSION_CATALOG } = require('./catalog');

/** @deprecated Use req.user.permissions from authenticate middleware */
const PERMISSIONS = PERMISSION_CATALOG;

module.exports = {
  PERMISSIONS,
  PERMISSION_CATALOG,
};
