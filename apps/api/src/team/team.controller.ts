import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../auth/permissions.guard';
import { Permission } from '../auth/roles';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { TeamService } from './team.service';

@Controller('team')
@UseGuards(FirebaseAuthGuard, PermissionsGuard)
@RequirePermissions(Permission.ManageTeam)
export class TeamController {
  constructor(private readonly team: TeamService) {}

  @Get()
  list() {
    return this.team.list();
  }

  @Post()
  add(@CurrentUser() actor: AuthUser, @Body() body: AddTeamMemberDto) {
    return this.team.addAdmin(actor, body.email);
  }

  @Delete(':email')
  @HttpCode(204)
  async remove(@CurrentUser() actor: AuthUser, @Param('email') email: string): Promise<void> {
    await this.team.removeMember(actor, email);
  }
}
