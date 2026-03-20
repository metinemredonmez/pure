import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private config: ConfigService) {
    // 32 byte key for AES-256
    const secret =
      this.config.get('app.encryptionKey') || this.config.get('jwt.secret');
    const salt = this.config.get('app.encryptionSalt');
    if (!secret) {
      throw new Error('Encryption key or JWT secret must be configured');
    }
    this.key = crypto.scryptSync(secret, salt, 32);
  }

  /**
   * Encrypt sensitive data (MFA secrets, API keys, etc.)
   */
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash data (one-way, for API keys)
   */
  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Generate secure random token
   */
  generateToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate API key with prefix
   */
  generateApiKey(prefix = 'olp'): {
    key: string;
    hash: string;
    prefix: string;
  } {
    const randomPart = crypto.randomBytes(24).toString('base64url');
    const key = `${prefix}_${randomPart}`;
    const hash = this.hash(key);
    const keyPrefix = key.substring(0, 8);

    return { key, hash, prefix: keyPrefix };
  }

  /**
   * HMAC signature for webhooks
   */
  createHmacSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHmacSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    const expectedSignature = this.createHmacSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Hash API key (alias for hash method)
   */
  hashApiKey(apiKey: string): string {
    return this.hash(apiKey);
  }

  /**
   * Verify HMAC (alias for verifyHmacSignature)
   */
  verifyHmac(payload: string, signature: string, secret: string): boolean {
    // Handle different signature formats (sha256=xxx, xxx)
    const cleanSignature = signature.replace(/^sha256=/, '');
    return this.verifyHmacSignature(payload, cleanSignature, secret);
  }
}
