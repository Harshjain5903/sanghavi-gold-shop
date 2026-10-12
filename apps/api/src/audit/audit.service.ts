import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditActor {
  uid: string;
  email: string;
}

export interface AuditEntry {
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(actor: AuditActor, entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorUid: actor.uid,
        actorEmail: actor.email,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: entry.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  recent(limit = 100) {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  }
}
