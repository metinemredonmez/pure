import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private config: ConfigService) {
    this.client = new Redis({
      host: this.config.get('redis.host') || 'localhost',
      port: this.config.get('redis.port') || 6380,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (err) => this.logger.error('Redis error', err));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  // ═══════════════════════════════════════
  // JWT BLACKLIST
  // ═══════════════════════════════════════

  async blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
    await this.client.setex(`jwt:blacklist:${token}`, expiresInSeconds, '1');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.client.get(`jwt:blacklist:${token}`);
    return result === '1';
  }

  // ═══════════════════════════════════════
  // RATE LIMITING
  // ═══════════════════════════════════════

  async incrementRateLimit(
    key: string,
    windowSeconds: number,
  ): Promise<number> {
    const multi = this.client.multi();
    multi.incr(key);
    multi.expire(key, windowSeconds);
    const results = await multi.exec();
    return results ? (results[0][1] as number) : 0;
  }

  async getRateLimitCount(key: string): Promise<number> {
    const count = await this.client.get(key);
    return count ? parseInt(count, 10) : 0;
  }

  // ═══════════════════════════════════════
  // CACHE
  // ═══════════════════════════════════════

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  // ═══════════════════════════════════════
  // SESSION
  // ═══════════════════════════════════════

  async setSession(
    sessionId: string,
    data: any,
    ttlSeconds = 3600,
  ): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttlSeconds);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return this.get<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // ═══════════════════════════════════════
  // RAW REDIS OPERATIONS
  // ═══════════════════════════════════════

  /**
   * Increment a key
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  /**
   * Get raw string value (no JSON parsing)
   */
  async getRaw(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Set raw string value
   */
  async setRaw(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  // ═══════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  /**
   * Scan keys matching a pattern (better for large datasets)
   */
  async scan(pattern: string, count = 100): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, matchedKeys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        count,
      );
      cursor = nextCursor;
      keys.push(...matchedKeys);
    } while (cursor !== '0');

    return keys;
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    const keys = await this.scan(pattern);
    if (keys.length === 0) return 0;

    const pipeline = this.client.pipeline();
    keys.forEach((key) => pipeline.del(key));
    await pipeline.exec();

    return keys.length;
  }

  /**
   * Delete multiple specific keys
   */
  async deleteMany(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return this.client.del(...keys);
  }

  /**
   * Flush entire database (USE WITH CAUTION)
   */
  async flushAll(): Promise<void> {
    await this.client.flushdb();
  }

  /**
   * Get Redis server info
   */
  async getInfo(): Promise<Record<string, string>> {
    const info = await this.client.info();
    const lines = info.split('\r\n');
    const result: Record<string, string> = {};

    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Get database size (total key count)
   */
  async dbSize(): Promise<number> {
    return this.client.dbsize();
  }

  /**
   * Get memory usage
   */
  async getMemoryUsage(): Promise<{ used: string; peak: string }> {
    const info = await this.getInfo();
    return {
      used: info['used_memory_human'] || '0B',
      peak: info['used_memory_peak_human'] || '0B',
    };
  }

  /**
   * Get uptime in seconds
   */
  async getUptime(): Promise<number> {
    const info = await this.getInfo();
    return parseInt(info['uptime_in_seconds'] || '0', 10);
  }
}
