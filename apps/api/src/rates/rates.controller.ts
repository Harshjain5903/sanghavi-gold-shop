import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../auth/permissions.guard';
import { Permission } from '../auth/roles';
import { UpdateRatesDto } from './dto/update-rates.dto';
import { RatesService } from './rates.service';

@Controller('rates')
export class RatesController {
  constructor(private readonly rates: RatesService) {}

  /** Public: today's rates for the website. */
  @Get()
  current() {
    return this.rates.current();
  }

  @Put()
  @UseGuards(FirebaseAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ManageRates)
  update(@CurrentUser() actor: AuthUser, @Body() body: UpdateRatesDto) {
    return this.rates.update(actor, body);
  }
}
