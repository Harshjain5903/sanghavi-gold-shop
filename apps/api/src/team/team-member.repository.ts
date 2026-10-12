import { Injectable } from '@nestjs/common';
import { MemberStatus, TeamRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export { MemberStatus, TeamRole };

export interface TeamMember {
  id: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
  firebaseUid: string | null;
  invitedByEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTeamMember {
  email: string;
  role: TeamRole;
  status: MemberStatus;
  firebaseUid: string | null;
  invitedByEmail: string;
}

// Repository pattern: TeamService talks to this abstraction, not to Prisma,
// so business rules can be unit-tested with an in-memory implementation.
export abstract class TeamMemberRepository {
  abstract findAll(): Promise<TeamMember[]>;
  abstract findByEmail(email: string): Promise<TeamMember | null>;
  abstract create(member: NewTeamMember): Promise<TeamMember>;
  abstract update(
    email: string,
    changes: Partial<Pick<TeamMember, 'role' | 'status' | 'firebaseUid'>>,
  ): Promise<TeamMember>;
  abstract delete(email: string): Promise<void>;
}

@Injectable()
export class PrismaTeamMemberRepository extends TeamMemberRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findAll(): Promise<TeamMember[]> {
    return this.prisma.teamMember.findMany({ orderBy: [{ role: 'asc' }, { createdAt: 'asc' }] });
  }

  findByEmail(email: string): Promise<TeamMember | null> {
    return this.prisma.teamMember.findUnique({ where: { email } });
  }

  create(member: NewTeamMember): Promise<TeamMember> {
    return this.prisma.teamMember.create({ data: member });
  }

  update(
    email: string,
    changes: Partial<Pick<TeamMember, 'role' | 'status' | 'firebaseUid'>>,
  ): Promise<TeamMember> {
    return this.prisma.teamMember.update({ where: { email }, data: changes });
  }

  async delete(email: string): Promise<void> {
    await this.prisma.teamMember.delete({ where: { email } });
  }
}
