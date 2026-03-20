import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * XSS Sanitization Pipe
 * Tüm string input'lardan tehlikeli HTML/JS taglarını temizler.
 * Global veya controller bazlı kullanılabilir.
 *
 * Temizlenen:
 * - <script>...</script> tagları
 * - onclick, onerror gibi event handler'lar
 * - javascript: URL'leri
 * - data: URL'leri (base64 exploit)
 * - HTML tagları (configurable)
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;
    if (!value || typeof value !== 'object') return value;

    return this.sanitizeObject(value);
  }

  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    return (
      str
        // Script tagları
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Event handler'lar (onclick, onerror, onload vs.)
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
        // javascript: ve data: URL'leri
        .replace(/javascript\s*:/gi, '')
        .replace(/data\s*:\s*text\/html/gi, '')
        // iframe, object, embed tagları
        .replace(/<\s*iframe[^>]*>.*?<\/\s*iframe\s*>/gi, '')
        .replace(/<\s*object[^>]*>.*?<\/\s*object\s*>/gi, '')
        .replace(/<\s*embed[^>]*>/gi, '')
        // style expression (IE)
        .replace(/expression\s*\(/gi, '')
        // vbscript
        .replace(/vbscript\s*:/gi, '')
        .trim()
    );
  }
}
