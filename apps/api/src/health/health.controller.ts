import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness: is the server process up? Deliberately does NOT touch the database,
   * so the keep-awake pinger doesn't keep the database awake (and burn its free hours).
   */
  @Get()
  live() {
    return { status: 'ok', time: new Date().toISOString() };
  }

  /** Readiness: can the server reach the database? */
  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'ok', time: new Date().toISOString() };
  }
}
