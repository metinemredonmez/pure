import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationDto,
  PaginatedResult,
} from '../../common/pipes/pagination.pipe';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  // ── Blog Posts ──
  async findAllPosts(
    query: PaginationDto,
    publishedOnly = true,
  ): Promise<PaginatedResult<any>> {
    const where: any = publishedOnly ? { isPublished: true } : {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        include: {
          category: true,
        },
        skip: query.skip,
        take: query.limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async createPost(data: any) {
    return this.prisma.blogPost.create({ data, include: { category: true } });
  }

  async updatePost(id: string, data: any) {
    return this.prisma.blogPost.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async deletePost(id: string) {
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Post deleted' };
  }

  // ── FAQ kaldırıldı: orphan'dı (web'de hiç kullanılmıyordu). ──
  // /sss sayfası ayrı CmsPage modelini kullanıyor (subscriptionFaq is config tarafında).

  // ── SEO ──
  async getSeo(pagePath: string) {
    return this.prisma.seoMetadata.findUnique({ where: { pagePath } });
  }

  async upsertSeo(
    pagePath: string,
    data: {
      title?: string;
      description?: string;
      ogImage?: string;
      keywords?: string[];
    },
  ) {
    return this.prisma.seoMetadata.upsert({
      where: { pagePath },
      create: { pagePath, ...data },
      update: data,
    });
  }
}
