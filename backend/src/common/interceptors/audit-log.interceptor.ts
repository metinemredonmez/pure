import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;

    // Only log write operations
    const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isAdminRoute = url.includes('/admin/') || url.includes('/api/admin/');
    const isAuthRoute = url.includes('/auth/');

    // Skip logging for certain endpoints
    const skipEndpoints = [
      '/auth/refresh',
      '/health',
      '/audit-logs', // Don't log audit log reads
    ];
    const shouldSkip = skipEndpoints.some(endpoint => url.includes(endpoint));

    // Log admin operations and auth operations (login/logout)
    const shouldLog = (isWriteOperation && isAdminRoute) ||
                      (isAuthRoute && (url.includes('/login') || url.includes('/logout')));

    if (!shouldLog || shouldSkip) {
      return next.handle();
    }

    const startTime = Date.now();

    // Extract entity and action from URL and method
    const { entity, action, entityId } = this.parseRequest(method, url);

    return next.handle().pipe(
      tap({
        next: async (responseData) => {
          // Log successful operations
          try {
            // For login, get userId from response
            let userId = user?.sub || user?.id || null;
            if (action === 'LOGIN' && responseData?.user?.id) {
              userId = responseData.user.id;
            }

            // For login/register, include email in entity data
            let logData = this.sanitizeData(body);
            if (action === 'LOGIN' || action === 'REGISTER') {
              logData = { email: body?.email };
            }

            await this.prisma.auditLog.create({
              data: {
                userId,
                action,
                entity,
                entityId: entityId || responseData?.id || responseData?.data?.id || null,
                newData: logData,
                ipAddress: this.getClientIp(request),
                userAgent: headers['user-agent'] || null,
              },
            });
          } catch (error) {
            // Don't fail the request if audit logging fails
            console.error('Audit log error:', error);
          }
        },
        error: async (error) => {
          // Optionally log failed operations
          try {
            await this.prisma.auditLog.create({
              data: {
                userId: user?.sub || user?.id || null,
                action: `${action}_FAILED`,
                entity,
                entityId,
                newData: { error: error.message, body: this.sanitizeData(body) },
                ipAddress: this.getClientIp(request),
                userAgent: headers['user-agent'] || null,
              },
            });
          } catch (logError) {
            console.error('Audit log error:', logError);
          }
        },
      }),
    );
  }

  private parseRequest(method: string, url: string): { entity: string; action: string; entityId?: string } {
    // Remove query params and /api prefix
    const cleanUrl = url.split('?')[0].replace(/^\/api/, '');
    const parts = cleanUrl.split('/').filter(Boolean);

    // Handle auth routes specially
    if (cleanUrl.includes('/auth/login')) {
      return { entity: 'AUTH', action: 'LOGIN' };
    }
    if (cleanUrl.includes('/auth/logout')) {
      return { entity: 'AUTH', action: 'LOGOUT' };
    }
    if (cleanUrl.includes('/auth/register')) {
      return { entity: 'AUTH', action: 'REGISTER' };
    }

    // Map HTTP methods to actions
    const methodToAction: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    const action = methodToAction[method] || method;

    // Extract entity from URL
    // Example: /admin/products/123 -> entity: 'products', entityId: '123'
    // Example: /admin/users/123/ban -> entity: 'users', entityId: '123', action: 'BAN'

    let entity = 'unknown';
    let entityId: string | undefined;

    // Find the main entity (usually after 'admin')
    const adminIndex = parts.indexOf('admin');
    if (adminIndex !== -1 && parts[adminIndex + 1]) {
      entity = parts[adminIndex + 1].toUpperCase();

      // Check if next part is an ID (UUID or number)
      const potentialId = parts[adminIndex + 2];
      if (potentialId && this.isId(potentialId)) {
        entityId = potentialId;

        // Check for action suffix like /ban, /approve, /role
        const actionSuffix = parts[adminIndex + 3];
        if (actionSuffix && !this.isId(actionSuffix)) {
          return {
            entity,
            action: actionSuffix.toUpperCase(),
            entityId,
          };
        }
      }
    } else if (parts.length > 0) {
      // Non-admin routes
      entity = parts[0].toUpperCase();
      if (parts[1] && this.isId(parts[1])) {
        entityId = parts[1];
      }
    }

    return { entity, action, entityId };
  }

  private isId(str: string): boolean {
    // UUID pattern or numeric ID
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const numericPattern = /^\d+$/;
    return uuidPattern.test(str) || numericPattern.test(str);
  }

  private sanitizeData(data: any): any {
    if (!data) return null;

    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'passwordHash',
      'secret',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secretKey',
      'privateKey',
      'encryptedValue',
    ];

    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }
}
