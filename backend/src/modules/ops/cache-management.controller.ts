import {
  Controller,
  Get,
  Delete,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CacheManagementService,
  CacheGroupKey,
  CACHE_GROUPS,
} from './cache-management.service';

@ApiTags('Admin - Cache Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/cache')
export class AdminCacheController {
  constructor(private readonly cacheService: CacheManagementService) {}

  /**
   * GET /admin/cache/stats — Cache durumu
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved',
    schema: {
      example: {
        totalKeys: 1250,
        memoryUsed: '12.5M',
        memoryPeak: '15.2M',
        uptimeSeconds: 86400,
        uptimeFormatted: '1 gün',
        groupStats: [
          {
            group: 'products',
            name: 'Ürünler',
            description: 'Ürün listesi, detay, fiyat',
            keyCount: 450,
          },
        ],
      },
    },
  })
  async getStats() {
    return this.cacheService.getStats();
  }

  /**
   * GET /admin/cache/groups — Mevcut cache grupları
   */
  @Get('groups')
  @ApiOperation({ summary: 'Get available cache groups' })
  @ApiResponse({
    status: 200,
    description: 'Cache groups retrieved',
    schema: {
      example: [
        {
          key: 'products',
          name: 'Ürünler',
          description: 'Ürün listesi, detay, fiyat',
          prefix: 'cache:products:*',
        },
      ],
    },
  })
  getGroups() {
    return this.cacheService.getGroups();
  }

  /**
   * DELETE /admin/cache/flush-all — Tüm cache'i temizle
   */
  @Delete('flush-all')
  @ApiOperation({ summary: 'Flush all cache (DANGER!)' })
  @ApiResponse({
    status: 200,
    description: 'All cache flushed',
    schema: {
      example: {
        success: true,
        message: 'Tüm cache temizlendi. 1250 key silindi.',
      },
    },
  })
  async flushAll() {
    return this.cacheService.flushAll();
  }

  /**
   * DELETE /admin/cache/:group — Grup bazlı temizle
   */
  @Delete(':group')
  @ApiOperation({ summary: 'Clear cache by group' })
  @ApiParam({
    name: 'group',
    enum: Object.keys(CACHE_GROUPS),
    description: 'Cache group name',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache group cleared',
    schema: {
      example: {
        success: true,
        deletedCount: 150,
        message: "Ürünler cache'i temizlendi. 150 key silindi.",
      },
    },
  })
  async clearGroup(@Param('group') group: string) {
    return this.cacheService.clearGroup(group as CacheGroupKey);
  }

  /**
   * POST /admin/cache/clear-multiple — Birden fazla grup temizle
   */
  @Post('clear-multiple')
  @ApiOperation({ summary: 'Clear multiple cache groups at once' })
  @ApiResponse({
    status: 200,
    description: 'Multiple cache groups cleared',
    schema: {
      example: {
        success: true,
        results: [
          { group: 'products', deletedCount: 150 },
          { group: 'pricing', deletedCount: 50 },
        ],
        totalDeleted: 200,
      },
    },
  })
  async clearMultiple(@Body() body: { groups: CacheGroupKey[] }) {
    return this.cacheService.clearGroups(body.groups);
  }

  /**
   * POST /admin/cache/clear-pattern — Özel pattern ile temizle
   */
  @Post('clear-pattern')
  @ApiOperation({ summary: 'Clear cache by custom pattern' })
  @ApiResponse({
    status: 200,
    description: 'Cache cleared by pattern',
    schema: {
      example: { deletedCount: 25 },
    },
  })
  async clearByPattern(@Body() body: { pattern: string }) {
    return this.cacheService.clearByPattern(body.pattern);
  }

  /**
   * POST /admin/cache/warm-up — Cache'i ön yükle
   */
  @Post('warm-up')
  @ApiOperation({ summary: 'Warm up cache with frequently accessed data' })
  @ApiResponse({
    status: 200,
    description: 'Cache warm-up completed',
    schema: {
      example: { warmedGroups: ['products', 'categories', 'shipping'] },
    },
  })
  async warmUp() {
    return this.cacheService.warmUp();
  }
}
