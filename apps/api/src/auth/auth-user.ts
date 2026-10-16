import { VerifiedToken } from '../firebase/identity-provider';

/** The signed-in user attached to each authenticated request. */
export type AuthUser = VerifiedToken;

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthUser;
}
