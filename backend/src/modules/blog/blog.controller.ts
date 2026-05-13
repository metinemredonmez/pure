import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { BlogService } from './blog.service';

@ApiTags('Blog')
@Controller()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ══════════════════════════════════════
  // PUBLIC
  // ══════════════════════════════════════

  @Public()
  @Get('public/blog-posts')
  @ApiOperation({ summary: 'List published blog posts' })
  listPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('search') search?: string,
  ) {
    return this.blogService.listPublic({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      categorySlug,
      search,
    });
  }

  @Public()
  @Get('public/blog-posts/:slug')
  @ApiOperation({ summary: 'Get published blog post by slug' })
  getPostBySlug(@Param('slug') slug: string) {
    return this.blogService.getPublicBySlug(slug);
  }

  @Public()
  @Get('public/blog-categories')
  @ApiOperation({ summary: 'List blog categories' })
  listCategories() {
    return this.blogService.listCategories();
  }

  // ══════════════════════════════════════
  // ADMIN
  // ══════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/blog-posts')
  @ApiOperation({ summary: 'List all blog posts (admin)' })
  listAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.blogService.listAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/blog-posts')
  @ApiOperation({ summary: 'Create blog post (admin)' })
  create(@Body() dto: any) {
    return this.blogService.create(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/blog-posts/:id')
  @ApiOperation({ summary: 'Update blog post (admin)' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.blogService.update(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/blog-posts/:id')
  @ApiOperation({ summary: 'Delete blog post (admin)' })
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/blog-categories')
  @ApiOperation({ summary: 'Create blog category (admin)' })
  createCategory(@Body() dto: any) {
    return this.blogService.createCategory(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/blog-categories/:id')
  @ApiOperation({ summary: 'Update blog category (admin)' })
  updateCategory(@Param('id') id: string, @Body() dto: any) {
    return this.blogService.updateCategory(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/blog-categories/:id')
  @ApiOperation({ summary: 'Delete blog category (admin)' })
  removeCategory(@Param('id') id: string) {
    return this.blogService.removeCategory(id);
  }

  // ══════════════════════════════════════
  // COMMENTS — PUBLIC
  // ══════════════════════════════════════

  @Public()
  @Get('public/blog-posts/:slug/comments')
  @ApiOperation({ summary: 'List approved comments for a blog post' })
  listComments(@Param('slug') slug: string) {
    return this.blogService.listApprovedComments(slug);
  }

  @Public()
  @Post('public/blog-posts/:slug/comments')
  @ApiOperation({ summary: 'Submit a comment for a blog post (pending moderation)' })
  submitComment(
    @Param('slug') slug: string,
    @Body() dto: { authorName: string; authorEmail?: string; body: string },
  ) {
    return this.blogService.createComment(slug, dto);
  }

  // ══════════════════════════════════════
  // COMMENTS — ADMIN
  // ══════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/blog-comments')
  @ApiOperation({ summary: 'List blog comments (admin)' })
  listAllComments(
    @Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blogService.listAllComments({
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/blog-comments/:id/status')
  @ApiOperation({ summary: 'Update comment status (admin)' })
  setCommentStatus(
    @Param('id') id: string,
    @Body() dto: { status: 'PENDING' | 'APPROVED' | 'REJECTED' },
  ) {
    return this.blogService.setCommentStatus(id, dto.status);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/blog-comments/:id')
  @ApiOperation({ summary: 'Delete comment (admin)' })
  deleteComment(@Param('id') id: string) {
    return this.blogService.deleteComment(id);
  }
}
