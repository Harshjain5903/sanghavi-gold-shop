import { hasPermission, parseRole, Permission, Role } from './roles';

describe('roles', () => {
  it('only owners can manage the team', () => {
    expect(hasPermission(Role.Owner, Permission.ManageTeam)).toBe(true);
    expect(hasPermission(Role.Admin, Permission.ManageTeam)).toBe(false);
    expect(hasPermission(null, Permission.ManageCatalog)).toBe(false);
  });

  it('admins can manage catalog, rates and orders', () => {
    for (const permission of [Permission.ManageCatalog, Permission.ManageRates, Permission.ManageOrders]) {
      expect(hasPermission(Role.Admin, permission)).toBe(true);
    }
  });

  it('ignores unknown role claims', () => {
    expect(parseRole('superuser')).toBeNull();
    expect(parseRole('admin')).toBe(Role.Admin);
  });
});
