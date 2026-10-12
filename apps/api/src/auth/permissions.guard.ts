import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from './auth-user';
import { hasPermission, Permission } from './roles';

const PERMISSIONS_KEY = 'requiredPermissions';

/** Marks a route or controller as needing these permissions. Use after FirebaseAuthGuard. */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const allowed = required.every((permission) => hasPermission(user?.role ?? null, permission));
    if (!allowed) throw new ForbiddenException('You do not have access to this action');
    return true;
  }
}
