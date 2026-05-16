const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '..', '..', 'modules');

/** Map folder/file names to OpenAPI tag groups */
const TAG_BY_MODULE = {
  auth: 'Auth',
  patients: 'Patients',
  doctors: 'Doctors',
  doctor: 'Doctor App',
  appointments: 'Appointments',
  prescriptions: 'Prescriptions',
  reports: 'Reports',
  'lab-tests': 'Lab Tests',
  conversations: 'Conversations',
  'call-sessions': 'Call Sessions',
  notifications: 'Notifications',
  reviews: 'Reviews',
  services: 'Services',
  specialities: 'Specialities',
  'insurance-providers': 'Insurance Providers',
  'insurance-cases': 'Insurance Cases',
  'support-cases': 'Support Cases',
  payments: 'Payments',
  claims: 'Claims',
  reconciliations: 'Reconciliations',
  'doctor-payouts': 'Doctor Payouts',
  settings: 'Settings',
  'audit-logs': 'Audit Logs',
  dashboard: 'Dashboard',
  admin: 'Admin',
};

function toOpenApiPath(routePath) {
  return routePath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function resolveMountPrefix(moduleName, fileName) {
  const baseName = fileName.replace('.route.js', '').replace('.admin.route.js', '');

  if (fileName.endsWith('.admin.route.js')) {
    return `/admin/${moduleName}`;
  }

  if (baseName === moduleName) {
    return `/${moduleName}`;
  }

  return `/${moduleName}/${baseName}`;
}

function tagForRoute(moduleName, fileName, mountPrefix) {
  if (fileName.endsWith('.admin.route.js') && moduleName !== 'admin') {
    return `Admin - ${TAG_BY_MODULE[moduleName] || moduleName}`;
  }
  if (mountPrefix.startsWith('/admin')) {
    return 'Admin';
  }
  return TAG_BY_MODULE[moduleName] || moduleName;
}

function parseRouteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const routes = [];
  const routeRegex = /router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/gi;
  let match = routeRegex.exec(content);
  while (match) {
    routes.push({ method: match[1].toLowerCase(), path: match[2] });
    match = routeRegex.exec(content);
  }
  return routes;
}

function joinPaths(prefix, routePath) {
  const base = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
  if (routePath === '/') return base || '/';
  const segment = routePath.startsWith('/') ? routePath : `/${routePath}`;
  return `${base}${segment}`.replace(/\/+/g, '/');
}

const PUBLIC_PATH_PATTERNS = [
  /^\/auth\/(register|login|verify-otp|resend-otp|forgot-password|reset-password|refresh-token)/,
  /^\/doctor\/auth\//,
  /^\/doctor\/specializations$/,
  /^\/specialities/,
  /^\/insurance-providers/,
  /^\/doctors\/(search|\{)/,
  /^\/payments\/webhook$/,
  /^\/reviews\/doctor\//,
];

function isPublicPath(openApiPath, method) {
  if (method === 'get' && (openApiPath === '/settings' || openApiPath.startsWith('/services'))) return true;
  return PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(openApiPath));
}

function buildOperation(method, tag, summary, openApiPath) {
  const op = {
    tags: [tag],
    summary,
    responses: {
      200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Not found' },
    },
  };

  if (['post', 'put', 'patch'].includes(method)) {
    op.requestBody = {
      content: {
        'application/json': { schema: { type: 'object' } },
      },
    };
  }

  if (!isPublicPath(openApiPath, method)) {
    op.security = [{ bearerAuth: [] }];
  }

  return op;
}

function collectRouteFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectRouteFiles(full, acc);
    } else if (entry.name.endsWith('.route.js')) {
      acc.push(full);
    }
  });
  return acc;
}

function buildPathsFromRoutes() {
  const paths = {};
  const tagSet = new Set();

  const files = collectRouteFiles(MODULES_DIR);

  files.forEach((filePath) => {
    const moduleName = path.basename(path.dirname(filePath));
    const fileName = path.basename(filePath);
    const mountPrefix = resolveMountPrefix(moduleName, fileName);
    const tag = tagForRoute(moduleName, fileName, mountPrefix);
    tagSet.add(tag);

    const routes = parseRouteFile(filePath);
    routes.forEach(({ method, path: routePath }) => {
      const fullPath = joinPaths(mountPrefix, routePath);
      const openApiPath = toOpenApiPath(fullPath);
      if (!paths[openApiPath]) paths[openApiPath] = {};

      const summary = `${method.toUpperCase()} ${fullPath}`;
      if (!paths[openApiPath][method]) {
        paths[openApiPath][method] = buildOperation(method, tag, summary, openApiPath);
      }
    });
  });

  return { paths, tags: Array.from(tagSet) };
}

function mergeSpecs(manualSpec, autoSpec) {
  const mergedPaths = { ...autoSpec.paths };

  Object.entries(manualSpec.paths || {}).forEach(([pathKey, methods]) => {
    if (!mergedPaths[pathKey]) {
      mergedPaths[pathKey] = { ...methods };
      return;
    }
    mergedPaths[pathKey] = { ...mergedPaths[pathKey], ...methods };
  });

  const tagMap = new Map();
  (manualSpec.tags || []).forEach((t) => tagMap.set(t.name, t));
  autoSpec.tags.forEach((name) => {
    if (!tagMap.has(name)) {
      tagMap.set(name, { name, description: `${name} module endpoints` });
    }
  });

  const tagOrder = [
    'Dashboard', 'Admin', 'Auth', 'Patients', 'Doctors', 'Doctor App',
    'Appointments', 'Prescriptions', 'Reports', 'Lab Tests',
    'Conversations', 'Call Sessions', 'Notifications', 'Reviews',
    'Specialities', 'Services', 'Insurance Providers', 'Insurance Cases',
    'Support Cases', 'Payments', 'Claims', 'Reconciliations', 'Doctor Payouts',
    'Settings', 'Audit Logs',
  ];

  const adminChildTags = Array.from(tagMap.keys())
    .filter((n) => n.startsWith('Admin - '))
    .sort();

  const orderedTags = [];
  tagOrder.forEach((name) => {
    if (tagMap.has(name)) orderedTags.push(tagMap.get(name));
    if (name === 'Admin') adminChildTags.forEach((n) => orderedTags.push(tagMap.get(n)));
  });

  Array.from(tagMap.values()).forEach((t) => {
    if (!orderedTags.find((x) => x.name === t.name)) orderedTags.push(t);
  });

  return {
    ...manualSpec,
    paths: mergedPaths,
    tags: orderedTags,
  };
}

module.exports = {
  buildPathsFromRoutes,
  mergeSpecs,
  TAG_BY_MODULE,
};
