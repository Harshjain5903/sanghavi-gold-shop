import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../auth/auth-user';
import { Role } from '../auth/roles';
import { AppConfig } from '../config/env';
import { IdentityProvider, IdentityUser, VerifiedToken } from '../firebase/identity-provider';
import {
  MemberStatus,
  NewTeamMember,
  TeamMember,
  TeamMemberRepository,
  TeamRole,
} from './team-member.repository';
import { TeamService } from './team.service';

class InMemoryTeamMemberRepository extends TeamMemberRepository {
  rows = new Map<string, TeamMember>();

  async findAll() {
    return [...this.rows.values()];
  }
  async findByEmail(email: string) {
    return this.rows.get(email) ?? null;
  }
  async create(member: NewTeamMember) {
    const row: TeamMember = { ...member, id: member.email, createdAt: new Date(), updatedAt: new Date() };
    this.rows.set(member.email, row);
    return row;
  }
  async update(email: string, changes: Partial<TeamMember>) {
    const row = { ...this.rows.get(email)!, ...changes, updatedAt: new Date() };
    this.rows.set(email, row);
    return row;
  }
  async delete(email: string) {
    this.rows.delete(email);
  }
}

class FakeIdentityProvider extends IdentityProvider {
  users = new Map<string, IdentityUser>();
  roles = new Map<string, Role | null>();
  revoked: string[] = [];

  async verifyToken(): Promise<VerifiedToken> {
    throw new Error('not used');
  }
  async findUserByEmail(email: string) {
    return this.users.get(email) ?? null;
  }
  async setRole(uid: string, role: Role | null) {
    this.roles.set(uid, role);
  }
  async revokeSessions(uid: string) {
    this.revoked.push(uid);
  }
}

const OWNER: AuthUser = { uid: 'owner-uid', email: 'owner@shop.com', emailVerified: true, role: Role.Owner };

describe('TeamService', () => {
  let repo: InMemoryTeamMemberRepository;
  let identity: FakeIdentityProvider;
  let audit: { record: jest.Mock };
  let service: TeamService;

  beforeEach(() => {
    repo = new InMemoryTeamMemberRepository();
    identity = new FakeIdentityProvider();
    audit = { record: jest.fn() };
    const config: AppConfig = {
      databaseUrl: '',
      firebaseServiceAccountBase64: '',
      ownerEmails: ['owner@shop.com'],
      corsOrigins: [],
      port: 0,
      cloudinary: null,
    };
    service = new TeamService(repo, identity, audit as unknown as AuditService, config);
  });

  describe('addAdmin', () => {
    it('activates immediately when the person already has a verified account', async () => {
      identity.users.set('staff@shop.com', { uid: 'staff-uid', email: 'staff@shop.com', emailVerified: true });

      const member = await service.addAdmin(OWNER, '  Staff@Shop.com ');

      expect(member).toMatchObject({ email: 'staff@shop.com', status: MemberStatus.ACTIVE, firebaseUid: 'staff-uid' });
      expect(identity.roles.get('staff-uid')).toBe(Role.Admin);
      expect(audit.record).toHaveBeenCalledWith(OWNER, expect.objectContaining({ action: 'TEAM_MEMBER_ADDED' }));
    });

    it('leaves the invite pending when the account email is not verified', async () => {
      identity.users.set('staff@shop.com', { uid: 'staff-uid', email: 'staff@shop.com', emailVerified: false });

      const member = await service.addAdmin(OWNER, 'staff@shop.com');

      expect(member.status).toBe(MemberStatus.INVITED);
      expect(identity.roles.has('staff-uid')).toBe(false);
    });

    it('rejects duplicates and owner emails', async () => {
      await service.addAdmin(OWNER, 'staff@shop.com');
      await expect(service.addAdmin(OWNER, 'staff@shop.com')).rejects.toBeInstanceOf(ConflictException);
      await expect(service.addAdmin(OWNER, 'owner@shop.com')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('removeMember', () => {
    it('removes the claim and signs the person out everywhere', async () => {
      identity.users.set('staff@shop.com', { uid: 'staff-uid', email: 'staff@shop.com', emailVerified: true });
      await service.addAdmin(OWNER, 'staff@shop.com');

      await service.removeMember(OWNER, 'staff@shop.com');

      expect(repo.rows.has('staff@shop.com')).toBe(false);
      expect(identity.roles.get('staff-uid')).toBeNull();
      expect(identity.revoked).toContain('staff-uid');
    });

    it('never removes an owner', async () => {
      await service.syncSession({ ...OWNER, role: null });
      await expect(service.removeMember(OWNER, 'owner@shop.com')).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('syncSession', () => {
    it('activates a pending invite once the invited person signs in with a verified email', async () => {
      await service.addAdmin(OWNER, 'staff@shop.com');

      const session = await service.syncSession({ uid: 'staff-uid', email: 'staff@shop.com', emailVerified: true, role: null });

      expect(session).toMatchObject({ role: Role.Admin, roleChanged: true });
      expect(repo.rows.get('staff@shop.com')?.status).toBe(MemberStatus.ACTIVE);
      expect(identity.roles.get('staff-uid')).toBe(Role.Admin);
    });

    it('does not grant an invite to an unverified email (someone registering another person’s address)', async () => {
      await service.addAdmin(OWNER, 'staff@shop.com');

      const session = await service.syncSession({ uid: 'attacker', email: 'staff@shop.com', emailVerified: false, role: null });

      expect(session).toMatchObject({ role: null, emailVerificationRequired: true, roleChanged: false });
      expect(identity.roles.has('attacker')).toBe(false);
    });

    it('sets up configured owners on first sign-in', async () => {
      const session = await service.syncSession({ ...OWNER, role: null });

      expect(session.role).toBe(Role.Owner);
      expect(session.permissions).toContain('team:manage');
      expect(repo.rows.get('owner@shop.com')).toMatchObject({ role: TeamRole.OWNER, status: MemberStatus.ACTIVE });
    });

    it('strips a stale admin claim from someone not on the team', async () => {
      const session = await service.syncSession({ uid: 'old-uid', email: 'old@shop.com', emailVerified: true, role: Role.Admin });

      expect(session).toMatchObject({ role: null, roleChanged: true });
      expect(identity.roles.get('old-uid')).toBeNull();
    });
  });
});
