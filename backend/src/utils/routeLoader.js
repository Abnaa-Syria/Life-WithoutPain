const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

/**
 * Automatically loads routes from the modules directory.
 * Scans each module folder for files ending in .route.js and .admin.route.js.
 * 
 * @param {import('express').Application} app The Express application instance
 * @param {string} apiPrefix The API prefix (e.g., /api/v1)
 */
function loadRoutes(app, apiPrefix) {
  const modulesPath = path.join(__dirname, '..', 'modules');
  const modules = fs.readdirSync(modulesPath);

  logger.info('Starting automatic route registration...');

  modules.forEach((moduleName) => {
    const modulePath = path.join(modulesPath, moduleName);
    
    // Check if it's a directory
    if (!fs.statSync(modulePath).isDirectory()) return;

    const files = fs.readdirSync(modulePath);

    files.forEach((file) => {
      // Load standard routes
      if (file.endsWith('.route.js') && !file.includes('.admin.')) {
        const routePath = path.join(modulePath, file);
        const route = require(routePath);
        
        // Infer route name from file or directory
        const baseName = file.replace('.route.js', '');
        const routeName = baseName === moduleName ? moduleName : `${moduleName}/${baseName}`;
        
        app.use(`${apiPrefix}/${routeName}`, route);
        logger.debug(`Registered route: ${apiPrefix}/${routeName}`);
      }

      // Load admin routes
      if (file.endsWith('.admin.route.js')) {
        const routePath = path.join(modulePath, file);
        const route = require(routePath);
        
        // Use module name for the route (e.g., /admin/doctors)
        app.use(`${apiPrefix}/admin/${moduleName}`, route);
        logger.debug(`Registered admin route: ${apiPrefix}/admin/${moduleName}`);
      }
    });
  });

  logger.info('Route registration completed.');
}

module.exports = loadRoutes;
