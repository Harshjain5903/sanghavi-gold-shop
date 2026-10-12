import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../auth/auth-user';
import { permissionsFor, Role } from '../auth/roles';
import { APP_CONFIG, AppConfig } from '../config/env';
import { IdentityProvider } from '../firebase/identity-provider';
import { MemberStatus, TeamMember, TeamMemberRepository, TeamRole } from './team-member.repository';

export interface SessionInfo {
  uid: string;
  email: string;
  emailVerified: boolean;
  role: Role | null;
  permissions: string[];
  /** True when the role claim just changed; the client must refresh its ID token. */
  roleChanged: boolean;
  /** True when access is waiting only on the user verifying their email. */
  emailVerificationRequired: boolean;
}

const toRole = (teamRole: TeamRole): Role => (teamRole === TeamRole.OWNER ? Role.Owner : Role.Admin);

/**
 * Manages who can use the admin portal.
 *
 * Rules:
 * - Owners are listed in the OWNER_EMAILS config and can't be removed through the API.
 * - Owners grant or remove admin access by email.
 * - Access is only activated for a *verified* email, so nobody can claim an invite
 *   by registering someone else's address with a password.
 * - The team_members table is the source of truth; Firebase role claims mirror it.
 */
@Injectable()
export class TeamService {
  constructor(
    private readonly members: TeamMemberRepository,
    private readonly identity: IdentityProvider,
    private readonly audit: AuditService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  list(): Promise<TeamMember[]> {
    return this.members.findAll();
  }

  async addAdmin(actor: AuthUser, rawEmail: string): Promise<TeamMember> {
    const email = rawEmail.trim().toLowerCase();
    if (this.isOwnerEmail(email)) {
      throw new BadRequestException('This email is already an owner');
    }
    if (await this.members.findByEmail(email)) {
      throw new ConflictException('This email is already on the team');
    }

    // Save the invite first: if the claim update below fails, the invite still
    // activates on the person's next sign-in instead of leaving a stray claim.
    let member = await this.members.create({
      email,
      role: TeamRole.ADMIN,
      status: MemberStatus.INVITED,
      firebaseUid: null,
      invitedByEmail: actor.email,
    });

    const account = await this.identity.findUserByEmail(email);
    if (account?.emailVerified) {
      await this.identity.setRole(account.uid, Role.Admin);
      member = await this.members.update(email, { status: MemberStatus.ACTIVE, firebaseUid: account.uid });
    }

    await this.audit.record(actor, {
      action: 'TEAM_MEMBER_ADDED',
      targetType: 'team_member',
      targetId: email,
      metadata: { role: member.role, status: member.status },
    });
    return member;
  }

  async removeMember(actor: AuthUser, rawEmail: string): Promise<void> {
    const email = rawEmail.trim().toLowerCase();
    const member = await this.members.findByEmail(email);
    if (!member) throw new NotFoundException('This email is not on the team');
    if (member.role === TeamRole.OWNER) {
      throw new ForbiddenException('Owners are managed in the server configuration');
    }

    await this.members.delete(email);
    if (member.firebaseUid) {
      await this.identity.setRole(member.firebaseUid, null);
      await this.identity.revokeSessions(member.firebaseUid);
    }

    await this.audit.record(actor, {
      action: 'TEAM_MEMBER_REMOVED',
      targetType: 'team_member',
      targetId: email,
      metadata: { role: member.role },
    });
  }

  /**
   * Called on every sign-in (GET /auth/me). Activates pending invites, sets up
   * configured owners, and removes role claims that no longer match the team table.
   */
  async syncSession(user: AuthUser): Promise<SessionInfo> {
    const { role, verificationRequired } = await this.resolveRole(user);

    const roleChanged = role !== user.role;
    if (roleChanged) {
      await this.identity.setRole(user.uid, role);
      await this.audit.record(user, {
        action: 'ROLE_CLAIM_SYNCED',
        targetType: 'user',
        targetId: user.uid,
        metadata: { from: user.role, to: role },
      });
    }

    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      role,
      permissions: permissionsFor(role),
      roleChanged,
      emailVerificationRequired: verificationRequired,
    };
  }

  private async resolveRole(user: AuthUser): Promise<{ role: Role | null; verificationRequired: boolean }> {
    if (!user.email) return { role: null, verificationRequired: false };

    const isOwner = this.isOwnerEmail(user.email);
    const member = await this.members.findByEmail(user.email);
    if (!isOwner && !member) return { role: null, verificationRequired: false };
    if (!user.emailVerified) return { role: null, verificationRequired: true };

    if (isOwner) {
      await this.upsertActive(user, TeamRole.OWNER, member);
      return { role: Role.Owner, verificationRequired: false };
    }

    // An OWNER row whose email was removed from config no longer grants anything.
    if (member!.role === TeamRole.OWNER) return { role: null, verificationRequired: false };

    await this.upsertActive(user, member!.role, member);
    return { role: toRole(member!.role), verificationRequired: false };
  }

  private async upsertActive(user: AuthUser, role: TeamRole, existing: TeamMember | null): Promise<void> {
    if (!existing) {
      await this.members.create({
        email: user.email,
        role,
        status: MemberStatus.ACTIVE,
        firebaseUid: user.uid,
        invitedByEmail: 'config:OWNER_EMAILS',
      });
      return;
    }
    if (existing.status !== MemberStatus.ACTIVE || existing.firebaseUid !== user.uid || existing.role !== role) {
      await this.members.update(user.email, { status: MemberStatus.ACTIVE, firebaseUid: user.uid, role });
    }
  }

  private isOwnerEmail(email: string): boolean {
    return this.config.ownerEmails.includes(email.toLowerCase());
  }
}
