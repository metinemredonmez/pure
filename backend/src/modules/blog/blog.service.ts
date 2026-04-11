import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface BlogListQuery {
  page?: number;
  limit?: number;
  categorySlug?: string;
  search?: string;
}

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async listPublic(query: BlogListQuery = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));

    const where: any = { isPublished: true };
    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        include: { category: true },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPublicBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!post || !post.isPublished) {
      throw new NotFoundException('Blog yazısı bulunamadı');
    }
    return post;
  }

  async listCategories() {
    return this.prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // ── Admin ──

  async listAll(query: BlogListQuery = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        include: { category: true },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.blogPost.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: any) {
    return this.prisma.blogPost.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Blog yazısı silindi' };
  }

  async createCategory(data: any) {
    return this.prisma.blogCategory.create({ data });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.blogCategory.update({ where: { id }, data });
  }

  async removeCategory(id: string) {
    await this.prisma.blogCategory.delete({ where: { id } });
    return { message: 'Kategori silindi' };
  }
}
