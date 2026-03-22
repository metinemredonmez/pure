import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateReviewDto,
  UpdateReviewDto,
  AdminApproveReviewDto,
} from './dto/review.dto';

@ApiTags('Reviews')
@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ══════════════════════════════════════════════
  // PUBLIC ENDPOINTS
  // ══════════════════════════════════════════════

  @Public()
  @Get('products/:productId/reviews')
  @ApiOperation({ summary: 'Get product reviews' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewService.getProductReviews(productId, page, limit);
  }

  @Public()
  @Get('products/:productId/reviews/stats')
  @ApiOperation({ summary: 'Get product review statistics' })
  getProductReviewStats(@Param('productId') productId: string) {
    return this.reviewService.getProductReviewStats(productId);
  }

  // ══════════════════════════════════════════════
  // USER ENDPOINTS
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Post('products/:productId/reviews')
  @ApiOperation({ summary: 'Create review for product' })
  createReview(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(userId, productId, dto);
  }

  @ApiBearerAuth('access-token')
  @Put('reviews/:id')
  @ApiOperation({ summary: 'Update own review' })
  updateReview(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(userId, reviewId, dto);
  }

  @ApiBearerAuth('access-token')
  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete own review' })
  deleteReview(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
  ) {
    return this.reviewService.deleteReview(userId, reviewId);
  }

  @ApiBearerAuth('access-token')
  @Get('users/me/reviews')
  @ApiOperation({ summary: 'Get my reviews' })
  getMyReviews(@CurrentUser('id') userId: string) {
    return this.reviewService.getUserReviews(userId);
  }

  @ApiBearerAuth('access-token')
  @Post('reviews/:id/helpful')
  @ApiOperation({ summary: 'Mark review as helpful (once per user)' })
  markHelpful(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
  ) {
    return this.reviewService.markReviewHelpful(reviewId, userId);
  }

  @ApiBearerAuth('access-token')
  @Post('reviews/:id/report')
  @ApiOperation({ summary: 'Report review' })
  reportReview(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
    @Body('reason') reason?: string,
  ) {
    return this.reviewService.reportReview(reviewId, userId, reason);
  }

  // ══════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/reviews')
  @ApiOperation({ summary: 'Admin: Get all reviews' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'isApproved', required: false })
  @ApiQuery({ name: 'isPublished', required: false })
  @ApiQuery({ name: 'productId', required: false })
  adminGetReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isApproved') isApproved?: string,
    @Query('isPublished') isPublished?: string,
    @Query('productId') productId?: string,
  ) {
    return this.reviewService.adminGetReviews({
      page,
      limit,
      isApproved:
        isApproved === 'true'
          ? true
          : isApproved === 'false'
            ? false
            : undefined,
      isPublished:
        isPublished === 'true'
          ? true
          : isPublished === 'false'
            ? false
            : undefined,
      productId,
    });
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/reviews/:id/approve')
  @ApiOperation({ summary: 'Admin: Approve/reject review' })
  adminApproveReview(
    @Param('id') reviewId: string,
    @Body() dto: AdminApproveReviewDto,
  ) {
    return this.reviewService.adminApproveReview(
      reviewId,
      dto.approve,
      dto.adminNote,
    );
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/reviews/:id')
  @ApiOperation({ summary: 'Admin: Delete review' })
  adminDeleteReview(@Param('id') reviewId: string) {
    return this.reviewService.adminDeleteReview(reviewId);
  }
}
