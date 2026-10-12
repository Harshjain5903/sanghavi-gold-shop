import { Inject, Injectable } from '@nestjs/common';
import { App, cert, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { APP_CONFIG, AppConfig } from '../config/env';
import { parseRole, Role } from '../auth/roles';
import { IdentityProvider, IdentityUser, VerifiedToken } from './identity-provider';

@Injectable()
export class FirebaseIdentityProvider extends IdentityProvider {
  private readonly auth: Auth;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    super();
    const serviceAccount = JSON.parse(
      Buffer.from(config.firebaseServiceAccountBase64, 'base64').toString('utf8'),
    );
    const app: App = initializeApp({ credential: cert(serviceAccount) });
    this.auth = getAuth(app);
  }

  async verifyToken(idToken: string): Promise<VerifiedToken> {
    const decoded = await this.auth.verifyIdToken(idToken, true);
    return {
      uid: decoded.uid,
      email: (decoded.email ?? '').toLowerCase(),
      emailVerified: decoded.email_verified === true,
      role: parseRole(decoded.role),
    };
  }

  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    try {
      const user = await this.auth.getUserByEmail(email);
      return { uid: user.uid, email: (user.email ?? email).toLowerCase(), emailVerified: user.emailVerified };
    } catch (error) {
      if ((error as { code?: string }).code === 'auth/user-not-found') return null;
      throw error;
    }
  }

  async setRole(uid: string, role: Role | null): Promise<void> {
    const user = await this.auth.getUser(uid);
    const { role: _oldRole, admin: _oldAdmin, ...otherClaims } = user.customClaims ?? {};
    // `admin: true` is kept for firestore.rules and the current frontend (lib/adminAuth.ts).
    const claims = role ? { ...otherClaims, role, admin: true } : otherClaims;
    await this.auth.setCustomUserClaims(uid, claims);
  }

  async revokeSessions(uid: string): Promise<void> {
    await this.auth.revokeRefreshTokens(uid);
  }
}
