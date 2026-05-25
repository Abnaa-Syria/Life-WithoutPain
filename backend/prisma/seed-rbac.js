/**
 * Idempotent RBAC seed — roles, permissions, role_permissions, demo overrides.
 * Usage: node prisma/seed-rbac.js
 */
const { PrismaClient } = require('@prisma/client');
const {
  PERMISSION_CATALOG,
  SYSTEM_ROLES,
  parsePermissionName,
  getPermissionsForRole,
} = require('../src/shared/permissions/catalog');
const { ROLES } = require('../src/constants');

/** Dashboard staff accounts — User.role must match Role.name in RBAC tables */
const STAFF_SEED_ACCOUNTS = [
  {
    key: 'superAdmin',
    fullName: 'مدير النظام',
    email: 'admin@hayabilaalam.com',
    role: ROLES.SUPER_ADMIN,
    phoneOffset: 1,
  },
  {
    key: 'medicalAdmin',
    fullName: 'المدير الطبي',
    email: 'medical@hayabilaalam.com',
    role: ROLES.MEDICAL_ADMIN,
    phoneOffset: 2,
  },
  {
    key: 'insuranceStaff',
    fullName: 'موظف التأمين',
    email: 'insurance@hayabilaalam.com',
    role: ROLES.INSURANCE_STAFF,
    phoneOffset: 3,
  },
  {
    key: 'supportStaff',
    fullName: 'موظف الدعم',
    email: 'support@hayabilaalam.com',
    role: ROLES.SUPPORT_STAFF,
    phoneOffset: 4,
  },
  {
    key: 'accountant',
    fullName: 'المحاسب',
    email: 'accountant@hayabilaalam.com',
    role: ROLES.ACCOUNTANT,
    phoneOffset: 5,
  },
];

const STAFF_SEED_EMAILS = STAFF_SEED_ACCOUNTS.map((a) => a.email);

/**
 * Demo user_permission overrides (grant/deny) for seeded staff — documents RBAC overrides.
 */
const DEMO_USER_PERMISSION_OVERRIDES = [
  {
    userKey: 'insuranceStaff',
    permission: 'support.tickets.list',
    granted: true,
  },
  {
    userKey: 'accountant',
    permission: 'patients.list',
    granted: true,
  },
  {
    userKey: 'medicalAdmin',
    permission: 'audit.view',
    granted: false,
  },
];

async function upsertPermission(prisma, name) {
  const { module, action } = parsePermissionName(name);
  return prisma.permission.upsert({
    where: { name },
    update: { module, action },
    create: {
      name,
      module,
      action,
      description: `${module} — ${action}`,
    },
  });
}

async function upsertRole(prisma, { name, displayName, description }) {
  return prisma.role.upsert({
    where: { name },
    update: { displayName, description, isSystem: true },
    create: {
      name,
      displayName,
      description,
      isSystem: true,
    },
  });
}

async function linkRolePermission(prisma, roleId, permissionId) {
  const existing = await prisma.rolePermission.findFirst({
    where: { roleId, permissionId },
  });
  if (existing) return existing;
  return prisma.rolePermission.create({
    data: { roleId, permissionId },
  });
}

async function assertRoleExists(prisma, roleName) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    throw new Error(`RBAC role "${roleName}" not found — run seedRbac() before creating users`);
  }
  return role;
}

/** Upsert roles from RBAC_EXTRA_SYSTEM_ROLES (e.g. MEDICAL_INSURANCE_AGENT after enum migration) */
async function seedOptionalRolesFromEnv(prisma) {
  const extra = process.env.RBAC_EXTRA_SYSTEM_ROLES;
  if (!extra) return;
  for (const raw of extra.split(',')) {
    const name = raw.trim().toUpperCase().replace(/\s+/g, '_');
    if (!name) continue;
    await upsertRole(prisma, {
      name,
      displayName: name.replace(/_/g, ' '),
      description: 'Seeded via RBAC_EXTRA_SYSTEM_ROLES',
    });
    console.log(`  Optional system role: ${name}`);
  }
}

async function seedRbac(prisma) {
  console.log('Seeding RBAC (roles, permissions, role_permissions)...');

  const permissionNames = Object.keys(PERMISSION_CATALOG);
  const permissionRecords = {};
  for (const name of permissionNames) {
    permissionRecords[name] = await upsertPermission(prisma, name);
  }
  console.log(`  Permissions: ${permissionNames.length}`);

  const roleRecords = {};
  for (const roleDef of SYSTEM_ROLES) {
    roleRecords[roleDef.name] = await upsertRole(prisma, roleDef);
  }
  console.log(`  Roles: ${SYSTEM_ROLES.length}`);
  await seedOptionalRolesFromEnv(prisma);

  let linkCount = 0;
  for (const roleDef of SYSTEM_ROLES) {
    const role = roleRecords[roleDef.name];
    const keys = getPermissionsForRole(roleDef.name);
    for (const key of keys) {
      const perm = permissionRecords[key];
      if (!perm) {
        console.warn(`  Missing permission record for ${key}`);
        continue;
      }
      await linkRolePermission(prisma, role.id, perm.id);
      linkCount += 1;
    }
  }
  console.log(`  Role-permission links: ${linkCount}`);

  const superAdminPerms = getPermissionsForRole(ROLES.SUPER_ADMIN);
  if (superAdminPerms.length !== permissionNames.length) {
    throw new Error(
      `SUPER_ADMIN bootstrap failed: expected ${permissionNames.length} permissions, got ${superAdminPerms.length}`,
    );
  }

  console.log('RBAC seed completed.');
  return { permissionRecords, roleRecords };
}

/**
 * Create dashboard staff users after RBAC tables are populated.
 * @param {Function} upsertUser - (payload) => Promise<User>
 * @param {Function} phoneFn - (offset) => string
 */
async function seedStaffUsers(prisma, { upsertUser, phoneFn, passwordHash }) {
  const staff = {};

  for (const account of STAFF_SEED_ACCOUNTS) {
    await assertRoleExists(prisma, account.role);
    staff[account.key] = await upsertUser({
      fullName: account.fullName,
      email: account.email,
      phoneNumber: phoneFn(account.phoneOffset),
      role: account.role,
      passwordHash,
    });
  }

  console.log(`  Staff users: ${STAFF_SEED_ACCOUNTS.length} (roles synced with RBAC)`);
  return staff;
}

async function clearStaffPermissionOverrides(prisma, staffUsers) {
  const userIds = Object.values(staffUsers).map((u) => u.id);
  if (!userIds.length) return;
  const deleted = await prisma.userPermission.deleteMany({
    where: { userId: { in: userIds } },
  });
  if (deleted.count > 0) {
    console.log(`  Cleared ${deleted.count} previous staff permission override(s)`);
  }
}

async function seedDemoUserPermissionOverrides(prisma, staffUsers) {
  await clearStaffPermissionOverrides(prisma, staffUsers);

  let count = 0;
  for (const override of DEMO_USER_PERMISSION_OVERRIDES) {
    const user = staffUsers[override.userKey];
    if (!user) continue;

    const permission = await prisma.permission.findUnique({
      where: { name: override.permission },
    });
    if (!permission) {
      console.warn(`  Demo override skipped — unknown permission: ${override.permission}`);
      continue;
    }

    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: { userId: user.id, permissionId: permission.id },
      },
      update: { granted: override.granted },
      create: {
        userId: user.id,
        permissionId: permission.id,
        granted: override.granted,
      },
    });
    count += 1;
  }

  console.log(`  Demo user permission overrides: ${count}`);
}

async function verifySeededStaffRbac(prisma, staffUsers) {
  const { getEffectivePermissions } = require('../src/modules/rbac/permission.service');
  const allPermissionCount = await prisma.permission.count();

  console.log('\nRBAC verification (effective permissions per staff user):');

  for (const account of STAFF_SEED_ACCOUNTS) {
    const user = staffUsers[account.key];
    const effective = await getEffectivePermissions(user.id, user.role);
    const expectedFromCatalog = getPermissionsForRole(account.role);
    const expectedCount =
      account.role === ROLES.SUPER_ADMIN ? allPermissionCount : expectedFromCatalog.length;

    if (account.role === ROLES.SUPER_ADMIN && effective.length < allPermissionCount) {
      throw new Error(
        `SUPER_ADMIN ${user.email}: expected ${allPermissionCount} permissions, got ${effective.length}`,
      );
    }

    if (effective.length < expectedCount) {
      console.warn(
        `  WARN ${user.email} (${account.role}): ${effective.length} permissions (catalog baseline ${expectedCount})`,
      );
    } else {
      console.log(`  OK ${user.email} (${account.role}): ${effective.length} permissions`);
    }

    for (const override of DEMO_USER_PERMISSION_OVERRIDES) {
      if (override.userKey !== account.key) continue;
      const has = effective.includes(override.permission);
      const shouldHave = override.granted;
      if (has !== shouldHave) {
        throw new Error(
          `Override failed for ${user.email}: ${override.permission} granted=${override.granted} effective=${has}`,
        );
      }
    }
  }
}

async function main() {
  const client = new PrismaClient();
  try {
    await seedRbac(client);
  } finally {
    await client.$disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  STAFF_SEED_ACCOUNTS,
  STAFF_SEED_EMAILS,
  DEMO_USER_PERMISSION_OVERRIDES,
  seedRbac,
  seedStaffUsers,
  seedDemoUserPermissionOverrides,
  verifySeededStaffRbac,
  assertRoleExists,
};
