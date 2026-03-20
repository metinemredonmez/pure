import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/services/redis.service';

// Cache group definitions with prefixes
export const CACHE_GROUPS = {
  products: {
    name: 'Ürünler',
    prefix: 'cache:products:*',
    description: 'Ürün listesi, detay, fiyat',
  },
  categories: {
    name: 'Kategoriler',
    prefix: 'cache:categories:*',
    description: 'Kategori ağacı',
  },
  pricing: {
    name: 'Fiyatlandırma',
    prefix: 'cache:pricing:*',
    description: 'Kanal fiyatları, hacim indirimi',
  },
  settings: {
    name: 'Ayarlar',
    prefix: 'cache:settings:*',
    description: 'Integration settings (3rd party key\'ler)',
  },
  shipping: {
    name: 'Kargo',
    prefix: 'cache:shipping:*',
    description: 'Kargo bölgeleri, ücret tablosu',
  },
  loyalty: {
    name: 'Sadakat',
    prefix: 'cache:loyalty:*',
    description: 'Loyalty config, tier eşikleri',
  },
  cms: {
    name: 'CMS',
    prefix: 'cache:cms:*',
    description: 'Blog, FAQ, SEO',
  },
  dashboard: {
    name: 'Dashboard',
    prefix: 'cache:dashboard:*',
    description: 'Admin dashboard KPI\'ları',
  },
  sessions: {
    name: 'Oturumlar',
    prefix: 'cache:sessions:*',
    description: 'JWT blacklist, login attempt',
  },
} as const;

export type CacheGroupKey = keyof typeof CACHE_GROUPS;

export interface CacheStats {
  totalKeys: number;
  memoryUsed: string;
  memoryPeak: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  groupStats: {
    group: CacheGroupKey;
    name: string;
    description: string;
    keyCount: number;
  }[];
}

@Injectable()
export class CacheManagementService {
  private readonly logger = new Logger(CacheManagementService.name);

  constructor(private readonly redis: RedisService) {}

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const [totalKeys, memory, uptime] = await Promise.all([
      this.redis.dbSize(),
      this.redis.getMemoryUsage(),
      this.redis.getUptime(),
    ]);

    // Get key count per group
    const groupStats = await Promise.all(
      Object.entries(CACHE_GROUPS).map(async ([key, config]) => {
        const keys = await this.redis.scan(config.prefix);
        return {
          group: key as CacheGroupKey,
          name: config.name,
          description: config.description,
          keyCount: keys.length,
        };
      }),
    );

    return {
      totalKeys,
      memoryUsed: memory.used,
      memoryPeak: memory.peak,
      uptimeSeconds: uptime,
      uptimeFormatted: this.formatUptime(uptime),
      groupStats,
    };
  }

  /**
   * Clear all cache (flush entire Redis)
   */
  async flushAll(): Promise<{ success: boolean; message: string }> {
    try {
      const keysBefore = await this.redis.dbSize();
      await this.redis.flushAll();

      this.logger.warn(`Cache flushed - ${keysBefore} keys deleted`);

      return {
        success: true,
        message: `Tüm cache temizlendi. ${keysBefore} key silindi.`,
      };
    } catch (error) {
      this.logger.error('Cache flush failed', error);
      return {
        success: false,
        message: 'Cache temizleme başarısız: ' + (error as Error).message,
      };
    }
  }

  /**
   * Clear cache by group
   */
  async clearGroup(group: CacheGroupKey): Promise<{ success: boolean; deletedCount: number; message: string }> {
    const config = CACHE_GROUPS[group];
    if (!config) {
      return {
        success: false,
        deletedCount: 0,
        message: `Bilinmeyen cache grubu: ${group}`,
      };
    }

    try {
      const deletedCount = await this.redis.deleteByPattern(config.prefix);

      this.logger.log(`Cache group cleared: ${group} - ${deletedCount} keys deleted`);

      return {
        success: true,
        deletedCount,
        message: `${config.name} cache'i temizlendi. ${deletedCount} key silindi.`,
      };
    } catch (error) {
      this.logger.error(`Cache group clear failed: ${group}`, error);
      return {
        success: false,
        deletedCount: 0,
        message: 'Cache temizleme başarısız: ' + (error as Error).message,
      };
    }
  }

  /**
   * Clear multiple groups at once
   */
  async clearGroups(groups: CacheGroupKey[]): Promise<{
    success: boolean;
    results: { group: string; deletedCount: number }[];
    totalDeleted: number;
  }> {
    const results = await Promise.all(
      groups.map(async (group) => {
        const result = await this.clearGroup(group);
        return { group, deletedCount: result.deletedCount };
      }),
    );

    const totalDeleted = results.reduce((sum, r) => sum + r.deletedCount, 0);

    return {
      success: true,
      results,
      totalDeleted,
    };
  }

  /**
   * Clear cache by custom pattern
   */
  async clearByPattern(pattern: string): Promise<{ deletedCount: number }> {
    const deletedCount = await this.redis.deleteByPattern(pattern);
    this.logger.log(`Cache cleared by pattern: ${pattern} - ${deletedCount} keys deleted`);
    return { deletedCount };
  }

  /**
   * Get available cache groups
   */
  getGroups(): { key: string; name: string; description: string; prefix: string }[] {
    return Object.entries(CACHE_GROUPS).map(([key, config]) => ({
      key,
      name: config.name,
      description: config.description,
      prefix: config.prefix,
    }));
  }

  /**
   * Invalidate product cache (use after product CRUD)
   */
  async invalidateProducts(productId?: string): Promise<void> {
    if (productId) {
      await this.redis.deleteByPattern(`cache:products:${productId}:*`);
      await this.redis.del(`cache:products:detail:${productId}`);
    } else {
      await this.clearGroup('products');
    }
    // Also clear pricing cache as it depends on products
    await this.clearGroup('pricing');
  }

  /**
   * Invalidate category cache (use after category CRUD)
   */
  async invalidateCategories(): Promise<void> {
    await this.clearGroup('categories');
    // Also clear product cache as it includes category info
    await this.clearGroup('products');
  }

  /**
   * Invalidate settings cache (use after settings update)
   */
  async invalidateSettings(key?: string): Promise<void> {
    if (key) {
      await this.redis.del(`cache:settings:${key}`);
    } else {
      await this.clearGroup('settings');
    }
  }

  /**
   * Invalidate shipping cache (use after shipping settings update)
   */
  async invalidateShipping(): Promise<void> {
    await this.clearGroup('shipping');
  }

  /**
   * Invalidate loyalty cache (use after loyalty config update)
   */
  async invalidateLoyalty(): Promise<void> {
    await this.clearGroup('loyalty');
  }

  /**
   * Invalidate CMS cache (use after blog/FAQ update)
   */
  async invalidateCms(entityType?: 'blog' | 'faq' | 'seo'): Promise<void> {
    if (entityType) {
      await this.redis.deleteByPattern(`cache:cms:${entityType}:*`);
    } else {
      await this.clearGroup('cms');
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUp(): Promise<{ warmedGroups: string[] }> {
    // This would be implemented based on actual data loading logic
    // For now, it's a placeholder
    const warmedGroups: string[] = [];

    this.logger.log('Cache warm-up started');

    // TODO: Implement actual cache warming logic
    // - Load popular products
    // - Load category tree
    // - Load shipping zones
    // - Load loyalty config

    this.logger.log('Cache warm-up completed');

    return { warmedGroups };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} gün`);
    if (hours > 0) parts.push(`${hours} saat`);
    if (minutes > 0) parts.push(`${minutes} dk`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} sn`);

    return parts.join(' ');
  }
}
