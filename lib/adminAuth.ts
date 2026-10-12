import type { User } from 'firebase/auth';

export const hasAdminClaim = (claims: Record<string, unknown> | null | undefined): boolean => {
  if (!claims) return false;
  return claims.role === 'admin' || claims.admin === true;
};

export const checkAdminAccess = async (user: User | null): Promise<boolean> => {
  if (!user) return false;

  const tokenResult = await user.getIdTokenResult(true);
  return hasAdminClaim(tokenResult.claims as Record<string, unknown> | null | undefined);
};
