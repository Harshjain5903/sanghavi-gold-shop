import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { RatesController } from './rates.controller';
import { PrismaRatesRepository, RatesRepository } from './rates.repository';
import { RatesService } from './rates.service';

@Module({
  imports: [AuditModule],
  controllers: [RatesController],
  providers: [RatesService, { provide: RatesRepository, useClass: PrismaRatesRepository }],
  exports: [RatesService],
})
export class RatesModule {}
