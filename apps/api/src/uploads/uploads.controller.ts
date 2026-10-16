import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../auth/permissions.guard';
import { Permission } from '../auth/roles';
import { UploadsService, UploadTarget } from './uploads.service';

class SignUploadDto {
  @IsIn(['products', 'categories']) target: UploadTarget;
}

@Controller('uploads')
@UseGuards(FirebaseAuthGuard, PermissionsGuard)
@RequirePermissions(Permission.ManageCatalog)
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('signature')
  sign(@Body() body: SignUploadDto) {
    return this.uploads.sign(body.target);
  }
}
