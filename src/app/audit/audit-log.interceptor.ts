import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly config: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const enabled = this.config.get<string>('AUDIT_LOG_ENABLED');

    if (enabled === 'false' || !WRITE_METHODS.includes(req.method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => this.log(req),
        error: () => this.log(req, true),
      }),
    );
  }

  private async log(req: Request, isError = false) {
    try {
      const user: any = (req as any).user;
      const pathParts = req.path.split('/').filter(Boolean);
      const entity = pathParts[0];
      const idParam = req.params?.id || null;
      const action = this.mapAction(req.method, isError);

      await this.auditService.createLog({
        userId: user?.id ?? null,
        action,
        entity,
        entityId: idParam,
        metadata: sanitizeBody(req.body),
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null,
      });
    } catch (_) {
      // swallow
    }
  }

  private mapAction(method: string, isError: boolean): string {
    const base =
      method === 'POST'
        ? 'create'
        : method === 'PUT' || method === 'PATCH'
          ? 'update'
          : method === 'DELETE'
            ? 'delete'
            : method.toLowerCase();
    return isError ? base + '_failed' : base;
  }
}

const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'accesstoken',
  'authorization',
  'passwordresettoken',
  'passwordresettokenexpiresat',
];

export function sanitizeBody(body: any) {
  if (!body || typeof body !== 'object') return body;
  if (Array.isArray(body)) return body.map((b) => sanitizeBody(b));
  const clone: any = {};
  for (const [k, v] of Object.entries(body)) {
    const lower = k.toLowerCase();
    if (SENSITIVE_KEYS.includes(lower)) continue;
    if (v && typeof v === 'object') clone[k] = sanitizeBody(v);
    else clone[k] = v;
  }
  return clone;
}
