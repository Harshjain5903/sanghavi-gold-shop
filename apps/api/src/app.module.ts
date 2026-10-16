import { Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { FirebaseModule } from './firebase/firebase.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [AppConfigModule, PrismaModule, FirebaseModule, AuditModule, TeamModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
