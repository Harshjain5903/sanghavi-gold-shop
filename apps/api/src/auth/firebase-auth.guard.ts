import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { IdentityProvider } from '../firebase/identity-provider';
import { AuthenticatedRequest } from './auth-user';

/** Requires `Authorization: Bearer <Firebase ID token>` and attaches the user to the request. */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly identity: IdentityProvider) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException('Missing sign-in token');

    try {
      request.user = await this.identity.verifyToken(token);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired sign-in token');
    }
  }
}
