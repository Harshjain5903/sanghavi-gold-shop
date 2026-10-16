import type { User } from 'firebase/auth';
import { apiFetch, isApiConfigured } from './api';

export type AdminRole = 'owner' | 'admin';

export interface AdminAccess {
  allowed: boolean;
  role: AdminRole | null;
  /** The account was invited but must verify its email before access is granted. */
  emailVerificationRequired: boolean;
}

interface SessionInfo {
  role: AdminRole | null;
  roleChanged: boolean;
  emailVerificationRequired: boolean;
}

export const hasAdminClaim = (claims: Record<string, unknown> | null | undefined): boolean => {
  if (!claims) return false;
  return claims.role === 'admin' || claims.role === 'owner' || claims.admin === true;
};

const roleFromClaims = (claims: Record<string, unknown>): AdminRole | null => {
  if (claims.role === 'owner' || claims.role === 'admin') return claims.role;
  return claims.admin === true ? 'admin' : null;
};

/**
 * Asks the backend to sync this user's role (activating a pending invite if any),
 * then reads the refreshed server-issued claims. If the backend is unreachable,
 * falls back to the claims already on the account.
 */
export const checkAdminAccess = async (user: User | null): Promise<AdminAccess> => {
  if (!user) return { allowed: false, role: null, emailVerificationRequired: false };

  let emailVerificationRequired = false;
  if (isApiConfigured()) {
    try {
      const session = await apiFetch<SessionInfo>('/auth/me');
      emailVerificationRequired = session.emailVerificationRequired;
    } catch (error) {
      console.warn('Admin API unavailable, using existing role claims.', error);
    }
  }

  // Force a refresh so a role the backend just granted or removed takes effect now.
  const { claims } = await user.getIdTokenResult(true);
  const typedClaims = claims as Record<string, unknown>;
  return {
    allowed: hasAdminClaim(typedClaims),
    role: roleFromClaims(typedClaims),
    emailVerificationRequired,
  };
};
