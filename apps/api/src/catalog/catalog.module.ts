import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { RatesModule } from '../rates/rates.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { PrismaProductRepository, ProductRepository } from './product.repository';

@Module({
  imports: [AuditModule, RatesModule],
  controllers: [CatalogController],
  providers: [CatalogService, { provide: ProductRepository, useClass: PrismaProductRepository }],
})
export class CatalogModule {}
