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

  // ── Comments ──

  async listApprovedComments(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, isPublished: true },
    });
    if (!post || !post.isPublished) {
      throw new NotFoundException('Blog yazısı bulunamadı');
    }
    return this.prisma.blogComment.findMany({
      where: { postId: post.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        authorName: true,
        body: true,
        createdAt: true,
      },
    });
  }

  async createComment(slug: string, data: { authorName: string; authorEmail?: string; body: string }) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, isPublished: true },
    });
    if (!post || !post.isPublished) {
      throw new NotFoundException('Blog yazısı bulunamadı');
    }
    const authorName = (data.authorName || '').trim();
    const body = (data.body || '').trim();
    if (!authorName || authorName.length > 80) {
      throw new NotFoundException('Geçersiz isim');
    }
    if (!body || body.length < 2 || body.length > 2000) {
      throw new NotFoundException('Yorum en az 2, en fazla 2000 karakter olmalı');
    }
    const comment = await this.prisma.blogComment.create({
      data: {
        postId: post.id,
        authorName,
        authorEmail: data.authorEmail?.trim() || null,
        body,
      },
      select: { id: true },
    });
    return { id: comment.id, message: 'Yorumunuz onay bekliyor' };
  }

  async listAllComments(query: { status?: 'PENDING' | 'APPROVED' | 'REJECTED'; page?: number; limit?: number } = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 30));
    const where: any = {};
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.blogComment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          post: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prisma.blogComment.count({ where }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async setCommentStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.prisma.blogComment.update({ where: { id }, data: { status } });
  }

  async deleteComment(id: string) {
    await this.prisma.blogComment.delete({ where: { id } });
    return { message: 'Yorum silindi' };
  }
}
