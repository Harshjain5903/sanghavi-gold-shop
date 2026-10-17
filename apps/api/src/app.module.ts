import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { AppConfigModule } from './config/config.module';
import { FirebaseModule } from './firebase/firebase.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RatesModule } from './rates/rates.module';
import { TeamModule } from './team/team.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    // Per client IP: at most 100 requests per minute. Stops floods and scripted abuse.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    AppConfigModule, PrismaModule, FirebaseModule, AuditModule, TeamModule, AuthModule, RatesModule, CatalogModule, UploadsModule],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
