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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { PaginationDto } from '../../common/pipes/pagination.pipe';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  UpsertSeoDto,
} from './dto/cms.dto';

@ApiTags('CMS')
@Controller()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ── Public ──
  @Public()
  @Get('blog/posts')
  @ApiOperation({ summary: 'List published blog posts' })
  findPublishedPosts(@Query() query: PaginationDto) {
    return this.cmsService.findAllPosts(query, true);
  }

  @Public()
  @Get('blog/posts/:slug')
  @ApiOperation({ summary: 'Get blog post by slug' })
  findPostBySlug(@Param('slug') slug: string) {
    return this.cmsService.findPostBySlug(slug);
  }

  @Public()
  @Get('faq')
  @ApiOperation({ summary: 'List FAQs' })
  findFaqs(@Query('category') category?: string) {
    return this.cmsService.findAllFaqs(category);
  }

  // ── Admin ──
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/blog/posts')
  @ApiOperation({ summary: 'List all blog posts (admin)' })
  findAllPosts(@Query() query: PaginationDto) {
    return this.cmsService.findAllPosts(query, false);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/blog/posts')
  @ApiOperation({ summary: 'Create blog post (admin)' })
  createPost(@Body() dto: CreateBlogPostDto) {
    return this.cmsService.createPost(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/blog/posts/:id')
  @ApiOperation({ summary: 'Update blog post (admin)' })
  updatePost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.cmsService.updatePost(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/blog/posts/:id')
  @ApiOperation({ summary: 'Delete blog post (admin)' })
  deletePost(@Param('id') id: string) {
    return this.cmsService.deletePost(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/faq')
  @ApiOperation({ summary: 'Create FAQ item (admin)' })
  createFaq(
    @Body() data: { question: string; answer: string; category: string },
  ) {
    return this.cmsService.createFaq(data);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/seo/:pagePath')
  @ApiOperation({ summary: 'Update SEO metadata (admin)' })
  upsertSeo(@Param('pagePath') pagePath: string, @Body() dto: UpsertSeoDto) {
    return this.cmsService.upsertSeo(`/${pagePath}`, dto);
  }
}
