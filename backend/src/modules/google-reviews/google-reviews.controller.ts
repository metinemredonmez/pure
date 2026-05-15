import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { GoogleReviewsService } from './google-reviews.service';

@ApiTags('Google Reviews')
@Controller()
export class GoogleReviewsController {
  constructor(private readonly service: GoogleReviewsService) {}

  // Public — used by the storefront SectionGoogleReviews component
  @Public()
  @Get('public/google-reviews')
  @ApiOperation({ summary: 'Get Google reviews (cached, public)' })
  publicList() {
    return this.service.getReviews();
  }

  // Admin — same data, plus a force-refresh option (clears Redis cache)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/google-reviews')
  @ApiOperation({ summary: 'Get Google reviews (admin)' })
  adminList(@Query('refresh') refresh?: string) {
    return this.service.getReviews(refresh === '1' || refresh === 'true');
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/google-reviews/refresh')
  @ApiOperation({ summary: 'Force re-fetch from Google Places API (admin)' })
  async refresh() {
    await this.service.clearCache();
    return this.service.getReviews(true);
  }
}
