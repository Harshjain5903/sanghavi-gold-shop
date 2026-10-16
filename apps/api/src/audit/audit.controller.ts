import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../auth/permissions.guard';
import { Permission } from '../auth/roles';
import { AuditService } from './audit.service';

@Controller('audit-logs')
@UseGuards(FirebaseAuthGuard, PermissionsGuard)
@RequirePermissions(Permission.ViewAuditLog)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(@Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number) {
    return this.audit.recent(Math.min(Math.max(limit, 1), 500));
  }
}
