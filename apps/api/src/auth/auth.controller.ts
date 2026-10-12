import { Controller, Get, UseGuards } from '@nestjs/common';
import { TeamService } from '../team/team.service';
import { AuthUser } from './auth-user';
import { CurrentUser } from './current-user.decorator';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('auth')
@UseGuards(FirebaseAuthGuard)
export class AuthController {
  constructor(private readonly team: TeamService) {}

  /** Call after every sign-in. If `roleChanged` is true, refresh the ID token (getIdToken(true)). */
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.team.syncSession(user);
  }
}
