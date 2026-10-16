import { Role } from '../auth/roles';

// What the app needs from an identity system, independent of Firebase.
// Services depend on this abstraction (Dependency Inversion), so tests can
// use a fake and Firebase could be swapped later without touching business logic.

export interface IdentityUser {
  uid: string;
  email: string;
  emailVerified: boolean;
}

export interface VerifiedToken extends IdentityUser {
  role: Role | null;
}

export abstract class IdentityProvider {
  /** Verifies a sign-in token; rejects expired or revoked tokens. */
  abstract verifyToken(idToken: string): Promise<VerifiedToken>;
  abstract findUserByEmail(email: string): Promise<IdentityUser | null>;
  /** Sets the user's role claim, or removes it when role is null. */
  abstract setRole(uid: string, role: Role | null): Promise<void>;
  /** Signs the user out everywhere so a removed role stops working quickly. */
  abstract revokeSessions(uid: string): Promise<void>;
}
