import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        errors = (res as any).errors || null;
      } else {
        message = res as any;
      }
    } else if (
      exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    ) {
      // Prisma known request error — anlaşılır mesaja çevir.
      const code = (exception as any).code;
      status = HttpStatus.BAD_REQUEST;
      if (code === 'P2002') {
        message = 'Bu kayıt zaten mevcut (benzersizlik ihlali)';
      } else if (code === 'P2003') {
        message = 'İlişkili kayıtlar olduğu için bu işlem yapılamıyor';
      } else if (code === 'P2025') {
        message = 'Kayıt bulunamadı';
      } else {
        message = `Veritabanı hatası (${code})`;
      }
      errors = { code, meta: (exception as any).meta ?? null };
    }

    // Beklenmeyen hataları (5xx) mutlaka logla — aksi halde kök nedeni göremiyoruz.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request?.method} ${request?.originalUrl} -> ${status}: ${message}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
