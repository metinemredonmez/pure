import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
} from './dto/product.dto';
import {
  PaginationDto,
  PaginatedResult,
} from '../../common/pipes/pagination.pipe';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  // ── Products ──

  async findAll(query: PaginationDto): Promise<PaginatedResult<any>> {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
        skip: query.skip,
        take: query.limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.product.count({ where }),
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

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: { where: { isActive: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        collections: { include: { collection: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        costPrice: dto.costPrice,
      },
      include: { category: true, variants: true, images: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: dto as any,
      include: { category: true, variants: true, images: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted' };
  }

  // ── Variants ──

  async addVariant(productId: string, dto: CreateVariantDto) {
    await this.findById(productId);
    return this.prisma.productVariant.create({
      data: { productId, ...dto } as any,
    });
  }

  /**
   * Update stock with atomic increment/decrement
   * Use positive delta to add stock, negative to remove
   */
  async updateStock(variantId: string, delta: number) {
    if (delta < 0) {
      // Check current stock first to prevent negative
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { stock: true },
      });
      if (!variant) {
        throw new NotFoundException('Variant not found');
      }
      if (variant.stock + delta < 0) {
        throw new NotFoundException('Yetersiz stok');
      }
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: delta } },
    });
  }

  /**
   * Set absolute stock value (for admin inventory management)
   */
  async setStock(variantId: string, stock: number) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });
  }

  // ── Categories ──

  async findAllCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: { children: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    image?: string;
  }) {
    return this.prisma.category.create({ data });
  }

  // ── Collections ──

  async findAllCollections() {
    return this.prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createCollection(data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
  }) {
    return this.prisma.collection.create({ data });
  }

  // ── Helper ──

  private async findById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
