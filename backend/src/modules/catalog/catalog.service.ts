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

  async findAll(query: PaginationDto, admin = false): Promise<PaginatedResult<any>> {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    // Resolve category slug to categoryId
    if (query.category && !query.categoryId) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: query.category },
      });
      if (cat) {
        where.categoryId = cat.id;
      }
    }

    // Roast level filter
    if (query.roastLevel) {
      where.roastLevel = query.roastLevel;
    }

    // Weight filter
    if (query.weight) {
      where.weight = query.weight;
    }

    // Price range filter
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = query.minPrice;
      if (query.maxPrice) where.price.lte = query.maxPrice;
    }

    // Public storefront should only expose active products. Admin lists everything unless filtered.
    if (!admin) {
      where.isActive = true;
      where.status = query.status || 'ACTIVE';
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
    if (!product || !product.isActive || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
        collections: { include: { collection: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findBySlugAdmin(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
        collections: { include: { collection: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const { images, ...productData } = dto as any;
    return this.prisma.product.create({
      data: {
        ...productData,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        costPrice: dto.costPrice,
        ...(images?.length ? {
          images: {
            create: images.map((img: any, i: number) => ({
              url: img.url,
              alt: img.alt || productData.name || '',
              sortOrder: i,
            })),
          },
        } : {}),
      },
      include: { category: true, variants: true, images: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    const { images, ...updateData } = dto as any;

    const shouldUpdateImages = Array.isArray(images);

    if (shouldUpdateImages) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        ...(shouldUpdateImages && images.length > 0
          ? {
              images: {
                create: images.map((img: any, i: number) => ({
                  url: img.url,
                  alt: img.alt || '',
                  sortOrder: i,
                })),
              },
            }
          : {}),
      },
      include: { category: true, variants: true, images: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    // Tek transaction'da bağımlı kayıtları temizleyip ürünü siler.
    // OrderItem.productId artık nullable — ürün silinince DB-seviyesinde SET NULL ile
    // null olur; sipariş geçmişi productName/variantName snapshot'ı üzerinden korunur.
    await this.prisma.$transaction([
      this.prisma.cartItem.deleteMany({ where: { productId: id } }),
      this.prisma.wishlistItem.deleteMany({ where: { productId: id } }),
      this.prisma.review.deleteMany({ where: { productId: id } }),
      this.prisma.productCollection.deleteMany({ where: { productId: id } }),
      this.prisma.productImage.deleteMany({ where: { productId: id } }),
      this.prisma.productPrice.deleteMany({ where: { productId: id } }),
      this.prisma.customerPrice.deleteMany({ where: { productId: id } }),
      this.prisma.productVariant.deleteMany({ where: { productId: id } }),
      this.prisma.product.delete({ where: { id } }),
    ]);
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
   * Admin varyant editörü: gelen listeye göre varyantları ekle/güncelle; listede
   * olmayan mevcut varyantları SİLMEZ, isActive=false yapar (sipariş/sepet FK'sı
   * korunur — OrderItem.variant Restrict). id varsa güncelle, yoksa oluştur.
   */
  async saveVariants(productId: string, variants: any[]) {
    const product = await this.findById(productId);
    const existing = await this.prisma.productVariant.findMany({
      where: { productId },
    });
    const incomingIds = new Set(
      (variants || []).filter((v) => v.id).map((v) => v.id),
    );

    const VALID_GRINDS = [
      'WHOLE_BEAN', 'FRENCH_PRESS', 'V60', 'FILTER', 'ESPRESSO', 'TURKISH',
    ];
    const GRIND_LABELS: Record<string, string> = {
      WHOLE_BEAN: 'Çekirdek', FRENCH_PRESS: 'French Press', V60: 'V60',
      FILTER: 'Filtre', ESPRESSO: 'Espresso', TURKISH: 'Türk Kahvesi',
    };
    const normGrind = (g?: string) =>
      g && VALID_GRINDS.includes(g) ? g : null;

    await this.prisma.$transaction(async (tx) => {
      // Listede olmayan mevcut varyantları pasifleştir (silme yok)
      for (const ex of existing) {
        if (!incomingIds.has(ex.id) && ex.isActive) {
          await tx.productVariant.update({
            where: { id: ex.id },
            data: { isActive: false },
          });
        }
      }
      for (const v of variants || []) {
        const grind = normGrind(v.grindType);
        const gLabel = grind ? GRIND_LABELS[grind] : '';
        const name =
          (typeof v.name === 'string' && v.name.trim()) ||
          `${v.weight}g${gLabel ? ' - ' + gLabel : ''}`;
        const data: any = {
          name,
          grindType: grind,
          weight: Number(v.weight),
          price: Number(v.price),
          stock: Number(v.stock) || 0,
          isActive: true,
        };
        if (v.id) {
          await tx.productVariant.update({ where: { id: v.id }, data });
        } else {
          const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
          const sku =
            (typeof v.sku === 'string' && v.sku.trim()) ||
            `${product.sku}-${v.weight}-${grind || 'STD'}-${rand}`;
          await tx.productVariant.create({
            data: { productId, sku, ...data },
          });
        }
      }
    });

    return this.prisma.productVariant.findMany({
      where: { productId, isActive: true },
      orderBy: [{ weight: 'asc' }],
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
      include: {
        children: {
          include: { _count: { select: { products: true } } },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
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

  async updateCategory(id: string, data: Record<string, any>) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
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

  async updateCollection(id: string, data: Record<string, any>) {
    return this.prisma.collection.update({ where: { id }, data });
  }

  async deleteCollection(id: string) {
    return this.prisma.collection.delete({ where: { id } });
  }

  // ── Helper ──

}
