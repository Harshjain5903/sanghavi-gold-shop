import { Module } from '@nestjs/common';
import { TeamModule } from '../team/team.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [TeamModule],
  controllers: [AuthController],
})
export class AuthModule {}
