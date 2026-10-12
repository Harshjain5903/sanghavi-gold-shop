import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaTeamMemberRepository, TeamMemberRepository } from './team-member.repository';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [AuditModule],
  controllers: [TeamController],
  providers: [TeamService, { provide: TeamMemberRepository, useClass: PrismaTeamMemberRepository }],
  exports: [TeamService],
})
export class TeamModule {}
