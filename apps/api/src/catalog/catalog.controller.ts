import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../auth/permissions.guard';
import { Permission } from '../auth/roles';
import { CatalogService } from './catalog.service';
import { ProductInputDto } from './dto/product-input.dto';

@Controller('products')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  /** Public: all products with today's computed prices. */
  @Get()
  list(@Query('limit', new DefaultValuePipe(500), ParseIntPipe) limit: number) {
    return this.catalog.list(Math.min(Math.max(limit, 1), 1000));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.catalog.get(id);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ManageCatalog)
  create(@CurrentUser() actor: AuthUser, @Body() body: ProductInputDto) {
    return this.catalog.create(actor, body);
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ManageCatalog)
  update(@CurrentUser() actor: AuthUser, @Param('id') id: string, @Body() body: ProductInputDto) {
    return this.catalog.update(actor, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(FirebaseAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ManageCatalog)
  async remove(@CurrentUser() actor: AuthUser, @Param('id') id: string): Promise<void> {
    await this.catalog.remove(actor, id);
  }
}
