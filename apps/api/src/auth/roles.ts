// Role-based access control (RBAC).
// Code checks *permissions*, never role names, so adding a role later
// (e.g. a "catalog editor" for shop staff) is a one-line change here.

export enum Role {
  Owner = 'owner',
  Admin = 'admin',
}

export enum Permission {
  ManageTeam = 'team:manage',
  ViewAuditLog = 'audit:view',
  ManageCatalog = 'catalog:manage',
  ManageRates = 'rates:manage',
  ManageOrders = 'orders:manage',
}

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [Role.Owner]: Object.values(Permission),
  [Role.Admin]: [Permission.ManageCatalog, Permission.ManageRates, Permission.ManageOrders],
};

export const hasPermission = (role: Role | null, permission: Permission): boolean =>
  role !== null && ROLE_PERMISSIONS[role].includes(permission);

export const permissionsFor = (role: Role | null): Permission[] =>
  role ? [...ROLE_PERMISSIONS[role]] : [];

export const parseRole = (value: unknown): Role | null =>
  Object.values(Role).includes(value as Role) ? (value as Role) : null;
