import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogDto {
  userId?: number | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  metadata?: any;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: CreateAuditLogDto) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: data.userId ?? undefined,
          action: data.action,
          entity: data.entity ?? undefined,
          entityId: data.entityId ?? undefined,
          metadata: data.metadata ?? undefined,
          ip: data.ip ?? undefined,
          userAgent: data.userAgent ?? undefined,
        },
      });
    } catch (err) {
      this.logger.error('Failed to create audit log', err.stack || err.message);
    }
  }
}
