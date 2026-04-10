import { PrismaClient, UserRole, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed başlatılıyor...\n');

  // ── 1. Admin User ──
  const adminPassword = await bcrypt.hash('Admin2026!@#', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'donmezemre02@gmail.com' },
    update: {},
    create: {
      email: 'donmezemre02@gmail.com',
      passwordHash: adminPassword,
      firstName: 'Pure',
      lastName: 'Olentia',
      role: UserRole.ADMIN,
      provider: AuthProvider.LOCAL,
      emailVerified: true,
      isActive: true,
      privacyAccepted: true,
    },
  });
  console.log('✅ Admin user:', admin.email);

  // ── 5. Kategoriler ──
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'cekirdek-kahve' },
      update: {},
      create: {
        name: 'Çekirdek Kahve',
        slug: 'cekirdek-kahve',
        description: 'Taze kavrulmuş çekirdek kahveler',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ogutulmus-kahve' },
      update: {},
      create: {
        name: 'Öğütülmüş Kahve',
        slug: 'ogutulmus-kahve',
        description: 'Hazır öğütülmüş kahveler',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'filtre-kahve' },
      update: {},
      create: {
        name: 'Filtre Kahve',
        slug: 'filtre-kahve',
        description: 'Filtre demleme için uygun kahveler',
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'espresso' },
      update: {},
      create: {
        name: 'Espresso',
        slug: 'espresso',
        description: 'Espresso makineleri için kahveler',
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'turk-kahvesi' },
      update: {},
      create: {
        name: 'Türk Kahvesi',
        slug: 'turk-kahvesi',
        description: 'Geleneksel Türk kahvesi çeşitleri',
        isActive: true,
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sogukkahve' },
      update: {},
      create: {
        name: 'Soğuk Kahve',
        slug: 'sogukkahve',
        description: 'Cold brew ve soğuk kahve çeşitleri',
        isActive: true,
        sortOrder: 6,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ekipman' },
      update: {},
      create: {
        name: 'Ekipman',
        slug: 'ekipman',
        description: 'Kahve ekipmanları ve aksesuarlar',
        isActive: true,
        sortOrder: 7,
      },
    }),
  ]);
  console.log(`✅ ${categories.length} kategori oluşturuldu`);

  // ── 6. Ürünler ──
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'ethiopia-yirgacheffe' },
      update: {},
      create: {
        name: 'Ethiopia Yirgacheffe',
        slug: 'ethiopia-yirgacheffe',
        description: 'Etiyopya Yirgacheffe bölgesinden gelen, çiçeksi ve meyvemsi aromalara sahip özel kahve. Yüksek rakımda yetişen bu kahve, hafif gövdesi ve parlak asidik yapısıyla öne çıkar.',
        shortDescription: 'Çiçeksi ve meyvemsi aromalar, hafif gövde',
        price: 249.90,
        compareAtPrice: 299.90,
        costPrice: 120,
        sku: 'OLP-ETH-YRG-250',
        barcode: '8690001000001',
        stock: 150,
        lowStockThreshold: 20,
        categoryId: categories[0].id,
        origin: 'Etiyopya',
        region: 'Yirgacheffe',
        altitude: '1700-2200m',
        process: 'Yıkanmış (Washed)',
        roastLevel: 'MEDIUM',
        aromaProfile: ['çiçeksi', 'bergamot', 'limon', 'yasemin'],
        flavorNotes: 'Bergamot, limon, yasemin çiçeği, bal',
        isActive: true,
        isFeatured: true,
        status: 'ACTIVE',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'colombia-supremo' },
      update: {},
      create: {
        name: 'Colombia Supremo',
        slug: 'colombia-supremo',
        description: 'Kolombiya\'nın en büyük çekirdeklerinden oluşan Supremo, karamel ve fındık notalarıyla dengeli bir tat profili sunar. Orta kavrulmuş bu kahve her demleme yöntemiyle uyumludur.',
        shortDescription: 'Karamel ve fındık notaları, dengeli tat',
        price: 219.90,
        compareAtPrice: null,
        costPrice: 100,
        sku: 'OLP-COL-SUP-250',
        barcode: '8690001000002',
        stock: 200,
        lowStockThreshold: 25,
        categoryId: categories[0].id,
        origin: 'Kolombiya',
        region: 'Huila',
        altitude: '1500-1800m',
        process: 'Yıkanmış (Washed)',
        roastLevel: 'MEDIUM',
        aromaProfile: ['karamel', 'fındık', 'çikolata'],
        flavorNotes: 'Karamel, fındık, çikolata, hafif narenciye',
        isActive: true,
        isFeatured: true,
        status: 'ACTIVE',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'brazil-santos' },
      update: {},
      create: {
        name: 'Brazil Santos',
        slug: 'brazil-santos',
        description: 'Brezilya Santos, düşük asidik yapısıyla bilinen, fındıksı ve çikolatalı bir kahvedir. Espresso ve Türk kahvesi için idealdir.',
        shortDescription: 'Düşük asit, fındıksı ve çikolatalı',
        price: 189.90,
        compareAtPrice: null,
        costPrice: 85,
        sku: 'OLP-BRZ-SNT-250',
        barcode: '8690001000003',
        stock: 300,
        lowStockThreshold: 30,
        categoryId: categories[3].id,
        origin: 'Brezilya',
        region: 'Santos',
        altitude: '800-1200m',
        process: 'Doğal (Natural)',
        roastLevel: 'DARK',
        aromaProfile: ['çikolata', 'fındık', 'tütün'],
        flavorNotes: 'Bitter çikolata, fındık, tütün, meşe',
        isActive: true,
        isFeatured: false,
        status: 'ACTIVE',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'kenya-aa' },
      update: {},
      create: {
        name: 'Kenya AA',
        slug: 'kenya-aa',
        description: 'Kenya\'nın en yüksek kalite sınıfı olan AA, parlak asidik yapısı ve meyve notalarıyla öne çıkar. Pour over ve filtre demleme için mükemmeldir.',
        shortDescription: 'Parlak asidik, böğürtlen ve kuşburnu',
        price: 289.90,
        compareAtPrice: 349.90,
        costPrice: 140,
        sku: 'OLP-KEN-AA-250',
        barcode: '8690001000004',
        stock: 80,
        lowStockThreshold: 15,
        categoryId: categories[2].id,
        origin: 'Kenya',
        region: 'Nyeri',
        altitude: '1700-2000m',
        process: 'Yıkanmış (Washed)',
        roastLevel: 'LIGHT',
        aromaProfile: ['böğürtlen', 'kuşburnu', 'narenciye'],
        flavorNotes: 'Böğürtlen, kuşburnu, kan portakalı, siyah çay',
        isActive: true,
        isFeatured: true,
        status: 'ACTIVE',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'guatemala-antigua' },
      update: {},
      create: {
        name: 'Guatemala Antigua',
        slug: 'guatemala-antigua',
        description: 'Volkanik topraklarda yetişen Guatemala Antigua, baharatlı ve çikolatalı tat profiliyle bilinen klasik bir kahvedir.',
        shortDescription: 'Volkanik toprak, baharatlı çikolata',
        price: 259.90,
        compareAtPrice: null,
        costPrice: 115,
        sku: 'OLP-GTM-ANT-250',
        barcode: '8690001000005',
        stock: 120,
        lowStockThreshold: 20,
        categoryId: categories[0].id,
        origin: 'Guatemala',
        region: 'Antigua',
        altitude: '1500-1700m',
        process: 'Yıkanmış (Washed)',
        roastLevel: 'DARK',
        aromaProfile: ['tarçın', 'çikolata', 'karamel'],
        flavorNotes: 'Tarçın, bitter çikolata, karamel, badem',
        isActive: true,
        isFeatured: false,
        status: 'ACTIVE',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'olentia-house-blend' },
      update: {},
      create: {
        name: 'Olentia House Blend',
        slug: 'olentia-house-blend',
        description: 'Olentia Pure\'un özel harmanı. Brezilya, Kolombiya ve Etiyopya çekirdeklerinin dengeli birleşimi. Her gün içilebilecek, yumuşak ve dengeli bir kahve.',
        shortDescription: 'Özel harman, günlük içim',
        price: 199.90,
        compareAtPrice: null,
        costPrice: 90,
        sku: 'OLP-HSE-BLD-250',
        barcode: '8690001000006',
        stock: 500,
        lowStockThreshold: 50,
        categoryId: categories[0].id,
        origin: 'Blend',
        region: 'Brezilya, Kolombiya, Etiyopya',
        process: 'Karışık',
        roastLevel: 'MEDIUM',
        aromaProfile: ['karamel', 'çikolata', 'fındık', 'hafif meyve'],
        flavorNotes: 'Karamel, sütlü çikolata, fındık, hafif meyvemsi',
        isActive: true,
        isFeatured: true,
        status: 'ACTIVE',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'turk-kahvesi-geleneksel' },
      update: {},
      create: {
        name: 'Geleneksel Türk Kahvesi',
        slug: 'turk-kahvesi-geleneksel',
        description: 'Özel kavrulmuş ve çok ince öğütülmüş geleneksel Türk kahvesi. Cezve\'de pişirmeye hazır.',
        shortDescription: 'İnce öğütülmüş, cezve\'ye hazır',
        price: 149.90,
        compareAtPrice: null,
        costPrice: 60,
        sku: 'OLP-TRK-GEL-250',
        barcode: '8690001000007',
        stock: 400,
        lowStockThreshold: 40,
        categoryId: categories[4].id,
        origin: 'Blend',
        region: 'Brezilya, Kolombiya',
        process: 'Karışık',
        roastLevel: 'MEDIUM',
        grindType: 'TURKISH',
        aromaProfile: ['çikolata', 'baharat', 'toprak'],
        flavorNotes: 'Çikolata, tarçın, kakule, toprak',
        isActive: true,
        isFeatured: true,
        status: 'ACTIVE',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'cold-brew-konsantre' },
      update: {},
      create: {
        name: 'Cold Brew Konsantre',
        slug: 'cold-brew-konsantre',
        description: '24 saat soğuk demlenen özel Cold Brew konsantresi. Su veya süt ile karıştırarak içilebilir. 500ml şişe, yaklaşık 10 porsiyon.',
        shortDescription: '24 saat soğuk demleme, 10 porsiyon',
        price: 179.90,
        compareAtPrice: 219.90,
        costPrice: 70,
        sku: 'OLP-CLD-BRW-500',
        barcode: '8690001000008',
        stock: 100,
        lowStockThreshold: 15,
        categoryId: categories[5].id,
        origin: 'Blend',
        process: 'Cold Brew',
        roastLevel: 'MEDIUM',
        aromaProfile: ['çikolata', 'karamel', 'vanilya'],
        flavorNotes: 'Çikolata, karamel, vanilya, düşük asit',
        isActive: true,
        isFeatured: false,
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log(`✅ ${products.length} ürün oluşturuldu`);

  // ── 7. Ürün Varyantları ──
  for (const product of products.slice(0, 6)) {
    await prisma.productVariant.upsert({
      where: {
        productId_name: { productId: product.id, name: '250g Çekirdek' },
      },
      update: {},
      create: {
        productId: product.id,
        name: '250g Çekirdek',
        sku: `${product.sku}-250-CKR`,
        price: product.price,
        stock: Math.floor(Number(product.stock) * 0.4),
        grindType: 'WHOLE_BEAN',
        weight: 250,
      },
    });
    await prisma.productVariant.upsert({
      where: {
        productId_name: { productId: product.id, name: '250g Öğütülmüş - Filtre' },
      },
      update: {},
      create: {
        productId: product.id,
        name: '250g Öğütülmüş - Filtre',
        sku: `${product.sku}-250-FLT`,
        price: product.price,
        stock: Math.floor(Number(product.stock) * 0.3),
        grindType: 'FILTER',
        weight: 250,
      },
    });
    await prisma.productVariant.upsert({
      where: {
        productId_name: { productId: product.id, name: '1kg Çekirdek' },
      },
      update: {},
      create: {
        productId: product.id,
        name: '1kg Çekirdek',
        sku: `${product.sku}-1000-CKR`,
        price: Number(product.price) * 3.6,
        stock: Math.floor(Number(product.stock) * 0.2),
        grindType: 'WHOLE_BEAN',
        weight: 1000,
      },
    });
  }
  console.log('✅ Ürün varyantları oluşturuldu (250g çekirdek, 250g filtre, 1kg)');

  // ── 7.5 Ürün Görselleri ──
  // Gerçek Pure Olentia fotografları (backend/uploads/products'a kopyalanmış olmalı)
  const productImages: Record<string, string[]> = {
    'ethiopia-yirgacheffe': [
      '/uploads/products/brazil.jpg',
      '/uploads/products/brazil-2.jpg',
    ],
    'colombia-supremo': [
      '/uploads/products/brazil-2.jpg',
      '/uploads/products/brazil.jpg',
    ],
    'brazil-santos': [
      '/uploads/products/brazil.jpg',
      '/uploads/products/brazil-2.jpg',
    ],
    'kenya-aa': [
      '/uploads/products/brazil.jpg',
      '/uploads/products/brazil-2.jpg',
    ],
    'guatemala-antigua': [
      '/uploads/products/brazil-2.jpg',
      '/uploads/products/brazil.jpg',
    ],
    'olentia-house-blend': [
      '/uploads/products/turk-kahvesi-200gr.jpg',
      '/uploads/products/turk-kahvesi-200gr-1.jpg',
      '/uploads/products/turk-kahvesi-200gr-2.jpg',
      '/uploads/products/turk-kahvesi-200gr-3.jpg',
    ],
    'turk-kahvesi-geleneksel': [
      '/uploads/products/turk-kahvesi-100gr.jpg',
      '/uploads/products/turk-kahvesi-tekli-1.jpg',
      '/uploads/products/turk-kahvesi-tekli-2.jpg',
      '/uploads/products/turk-kahvesi-tekli-3.jpg',
    ],
    'cold-brew-konsantre': [
      '/uploads/products/turk-kahvesi-12li-kutu.jpg',
      '/uploads/products/turk-kahvesi-12li-1.jpg',
      '/uploads/products/turk-kahvesi-12li-2.jpg',
      '/uploads/products/turk-kahvesi-12li-3.jpg',
    ],
  };

  for (const product of products) {
    const images = productImages[product.slug];
    if (!images) continue;

    // Önceki görselleri temizle
    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    // Yeni görselleri ekle
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: images[i],
          alt: product.name,
          sortOrder: i,
        },
      });
    }
  }
  console.log('✅ Ürün görselleri eklendi (Pure Olentia arşivinden)');

  // ── 7.6 Ek Türk Kahvesi Ürünleri (farklı gramajlar) ──
  // Desktop/PureOlentia klasöründe olan türk kahvesi varyantlarını ayrı ürün olarak ekle
  const turkishCoffeeCategory = categories.find(c => c.slug === 'turk-kahvesi') || categories[5];

  const turkCoffeeProducts = [
    {
      name: 'Türk Kahvesi 100gr',
      slug: 'turk-kahvesi-100gr',
      sku: 'OLP-TRK-100',
      barcode: '8690001000010',
      price: 99.90,
      stock: 500,
      shortDescription: 'Geleneksel 100gr Türk Kahvesi',
      description: 'Özenle kavrulmuş ve ince öğütülmüş geleneksel Türk kahvesi. 100gr paket.',
      images: [
        '/uploads/products/turk-kahvesi-100gr.jpg',
        '/uploads/products/turk-kahvesi-tekli-1.jpg',
        '/uploads/products/turk-kahvesi-tekli-2.jpg',
        '/uploads/products/turk-kahvesi-tekli-3.jpg',
      ],
    },
    {
      name: 'Türk Kahvesi 200gr',
      slug: 'turk-kahvesi-200gr',
      sku: 'OLP-TRK-200',
      barcode: '8690001000011',
      price: 179.90,
      stock: 300,
      shortDescription: 'Geleneksel 200gr Türk Kahvesi',
      description: 'Özenle kavrulmuş ve ince öğütülmüş geleneksel Türk kahvesi. 200gr paket.',
      images: [
        '/uploads/products/turk-kahvesi-200gr.jpg',
        '/uploads/products/turk-kahvesi-200gr-1.jpg',
        '/uploads/products/turk-kahvesi-200gr-2.jpg',
        '/uploads/products/turk-kahvesi-200gr-3.jpg',
      ],
    },
    {
      name: 'Türk Kahvesi 3\'lü Set',
      slug: 'turk-kahvesi-3lu-set',
      sku: 'OLP-TRK-3LU',
      barcode: '8690001000012',
      price: 259.90,
      stock: 150,
      shortDescription: '3 adet 100gr Türk Kahvesi set',
      description: '3 adet 100gr geleneksel Türk kahvesi. Hediye paketi olarak ideal.',
      images: [
        '/uploads/products/turk-kahvesi-3lu-1.jpg',
        '/uploads/products/turk-kahvesi-3lu-2.jpg',
        '/uploads/products/turk-kahvesi-3lu-3.jpg',
      ],
    },
    {
      name: 'Türk Kahvesi 12\'li Kutu',
      slug: 'turk-kahvesi-12li-kutu',
      sku: 'OLP-TRK-12LI',
      barcode: '8690001000013',
      price: 899.90,
      stock: 80,
      shortDescription: '12 x 100gr Türk Kahvesi kutu',
      description: '12 adet 100gr geleneksel Türk kahvesi. İşletmeler ve toplu alım için ideal.',
      images: [
        '/uploads/products/turk-kahvesi-12li-kutu.jpg',
        '/uploads/products/turk-kahvesi-12li-1.jpg',
        '/uploads/products/turk-kahvesi-12li-2.jpg',
        '/uploads/products/turk-kahvesi-12li-3.jpg',
      ],
    },
  ];

  for (const p of turkCoffeeProducts) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        stock: p.stock,
        description: p.description,
        shortDescription: p.shortDescription,
      },
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        barcode: p.barcode,
        price: p.price,
        costPrice: p.price * 0.4,
        stock: p.stock,
        lowStockThreshold: 20,
        description: p.description,
        shortDescription: p.shortDescription,
        categoryId: turkishCoffeeCategory.id,
        origin: 'Blend',
        region: 'Brezilya, Kolombiya',
        roastLevel: 'MEDIUM',
        grindType: 'TURKISH',
        process: 'Geleneksel',
        aromaProfile: ['çikolata', 'baharat'],
        flavorNotes: 'Yoğun, baharatlı, çikolatamsı',
        isActive: true,
        isFeatured: true,
        status: 'ACTIVE',
      },
    });

    // Resimler
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: p.images[i],
          alt: p.name,
          sortOrder: i,
        },
      });
    }
  }
  console.log('✅ 4 ek Türk Kahvesi ürünü eklendi (100gr, 200gr, 3\'lü, 12\'li)');

  // ── 8. Koleksiyonlar ──
  const collections = await Promise.all([
    prisma.collection.upsert({
      where: { slug: 'en-cok-satanlar' },
      update: {},
      create: {
        name: 'En Çok Satanlar',
        slug: 'en-cok-satanlar',
        description: 'Müşterilerimizin en sevdiği kahveler',
        isActive: true,
      },
    }),
    prisma.collection.upsert({
      where: { slug: 'yeni-urunler' },
      update: {},
      create: {
        name: 'Yeni Ürünler',
        slug: 'yeni-urunler',
        description: 'Bu ay eklenen yeni kahveler',
        isActive: true,
      },
    }),
    prisma.collection.upsert({
      where: { slug: 'afrika-kahveleri' },
      update: {},
      create: {
        name: 'Afrika Kahveleri',
        slug: 'afrika-kahveleri',
        description: 'Etiyopya, Kenya ve daha fazlası',
        isActive: true,
      },
    }),
    prisma.collection.upsert({
      where: { slug: 'indirimli-urunler' },
      update: {},
      create: {
        name: 'İndirimli Ürünler',
        slug: 'indirimli-urunler',
        description: 'Fırsat ürünleri',
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${collections.length} koleksiyon oluşturuldu`);

  // ── 9. Kuponlar ──
  const coupons = await Promise.all([
    prisma.coupon.upsert({
      where: { code: 'HOSGELDIN' },
      update: {},
      create: {
        code: 'HOSGELDIN',
        description: 'Yeni üye hoş geldin indirimi',
        type: 'percentage',
        value: 15,
        minOrderAmount: 100,
        maxUses: 1000,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date('2026-12-31'),
      },
    }),
    prisma.coupon.upsert({
      where: { code: 'KAHVE10' },
      update: {},
      create: {
        code: 'KAHVE10',
        description: '₺10 indirim',
        type: 'fixed',
        value: 10,
        minOrderAmount: 50,
        maxUses: 5000,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date('2026-12-31'),
      },
    }),
    prisma.coupon.upsert({
      where: { code: 'YUZDE20' },
      update: {},
      create: {
        code: 'YUZDE20',
        description: '%20 indirim (max ₺50)',
        type: 'percentage',
        value: 20,
        minOrderAmount: 200,
        maxDiscount: 50,
        maxUses: 500,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date('2026-06-30'),
      },
    }),
    prisma.coupon.upsert({
      where: { code: 'UCRETSIKKARGO' },
      update: {},
      create: {
        code: 'UCRETSIKKARGO',
        description: 'Ücretsiz kargo',
        type: 'free_shipping',
        value: 0,
        minOrderAmount: 0,
        maxUses: 10000,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date('2026-12-31'),
      },
    }),
  ]);
  console.log(`✅ ${coupons.length} kupon oluşturuldu`);

  // ── 10. Email Template'ler ──
  const templates = await Promise.all([
    prisma.notificationTemplate.upsert({
      where: { name: 'welcome' },
      update: {},
      create: {
        name: 'welcome',
        channel: 'email',
        subject: 'Olentia Pure\'a Hoş Geldiniz! ☕',
        body: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f6; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5C4033; font-size: 28px;">Olentia Pure</h1>
            </div>
            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <h2 style="color: #5C4033;">Hoş geldiniz, {{firstName}}!</h2>
              <p style="color: #666; line-height: 1.6;">Olentia Pure ailesine katıldığınız için teşekkür ederiz. Sizin için özel olarak seçilmiş, dünyanın en iyi kahve çekirdeklerini keşfetmeye hazır olun.</p>
              <p style="color: #666;">🎁 <strong>25 hoş geldin puanı</strong> hesabınıza tanımlandı!</p>
              <a href="{{shopUrl}}" style="display: inline-block; background: #5C4033; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 15px;">Alışverişe Başla</a>
            </div>
            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">© 2026 Olentia Pure. Tüm hakları saklıdır.</p>
          </div>`,
        isActive: true,
      },
    }),
    prisma.notificationTemplate.upsert({
      where: { name: 'order_confirmed' },
      update: {},
      create: {
        name: 'order_confirmed',
        channel: 'email',
        subject: 'Siparişiniz Alındı — #{{orderNumber}}',
        body: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f6; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5C4033;">Olentia Pure</h1>
            </div>
            <div style="background: white; border-radius: 12px; padding: 30px;">
              <h2 style="color: #5C4033;">Siparişiniz Onaylandı! ✅</h2>
              <p style="color: #666;">Sipariş numaranız: <strong>#{{orderNumber}}</strong></p>
              <p style="color: #666;">Toplam tutar: <strong>₺{{total}}</strong></p>
              <p style="color: #666;">Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir.</p>
              <a href="{{trackingUrl}}" style="display: inline-block; background: #5C4033; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 15px;">Siparişimi Takip Et</a>
            </div>
          </div>`,
        isActive: true,
      },
    }),
    prisma.notificationTemplate.upsert({
      where: { name: 'password_reset' },
      update: {},
      create: {
        name: 'password_reset',
        channel: 'email',
        subject: 'Şifre Sıfırlama Talebi — Olentia Pure',
        body: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f6; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5C4033;">Olentia Pure</h1>
            </div>
            <div style="background: white; border-radius: 12px; padding: 30px;">
              <h2 style="color: #5C4033;">Şifre Sıfırlama</h2>
              <p style="color: #666;">Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın. Bu bağlantı 1 saat geçerlidir.</p>
              <a href="{{resetLink}}" style="display: inline-block; background: #5C4033; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 15px;">Şifremi Sıfırla</a>
              <p style="color: #999; font-size: 13px; margin-top: 20px;">Bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
            </div>
          </div>`,
        isActive: true,
      },
    }),
    prisma.notificationTemplate.upsert({
      where: { name: 'email_verification' },
      update: {},
      create: {
        name: 'email_verification',
        channel: 'email',
        subject: 'Email Adresinizi Doğrulayın — Olentia Pure',
        body: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f6; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5C4033;">Olentia Pure</h1>
            </div>
            <div style="background: white; border-radius: 12px; padding: 30px;">
              <h2 style="color: #5C4033;">Email Doğrulama</h2>
              <p style="color: #666;">Merhaba {{firstName}}, email adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın.</p>
              <a href="{{verifyLink}}" style="display: inline-block; background: #5C4033; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 15px;">Email Adresimi Doğrula</a>
              <p style="color: #999; font-size: 13px; margin-top: 20px;">Bu bağlantı 24 saat geçerlidir.</p>
            </div>
          </div>`,
        isActive: true,
      },
    }),
    prisma.notificationTemplate.upsert({
      where: { name: 'subscription_renewed' },
      update: {},
      create: {
        name: 'subscription_renewed',
        channel: 'email',
        subject: 'Aboneliğiniz Yenilendi — Olentia Pure',
        body: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f6; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5C4033;">Olentia Pure</h1>
            </div>
            <div style="background: white; border-radius: 12px; padding: 30px;">
              <h2 style="color: #5C4033;">Abonelik Yenilendi ☕</h2>
              <p style="color: #666;"><strong>{{planName}}</strong> aboneliğiniz başarıyla yenilendi.</p>
              <p style="color: #666;">Sonraki yenileme tarihi: <strong>{{nextDate}}</strong></p>
              <p style="color: #666;">Taze kahveniz yolda! 🚀</p>
            </div>
          </div>`,
        isActive: true,
      },
    }),
    prisma.notificationTemplate.upsert({
      where: { name: 'order_shipped' },
      update: {},
      create: {
        name: 'order_shipped',
        channel: 'email',
        subject: 'Siparişiniz Kargoda! 🚚 #{{orderNumber}}',
        body: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f6; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5C4033;">Olentia Pure</h1>
            </div>
            <div style="background: white; border-radius: 12px; padding: 30px;">
              <h2 style="color: #5C4033;">Kargoya Verildi! 🚚</h2>
              <p style="color: #666;">Sipariş #{{orderNumber}} kargoya verildi.</p>
              <p style="color: #666;">Takip numaranız: <strong>{{trackingNumber}}</strong></p>
              <a href="{{trackingUrl}}" style="display: inline-block; background: #5C4033; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 15px;">Kargoyu Takip Et</a>
            </div>
          </div>`,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${templates.length} email template oluşturuldu`);

  // ── 11. Abonelik Planları ──
  const plans = await Promise.all([
    prisma.subPlan.upsert({
      where: { slug: 'starter' },
      update: {},
      create: {
        name: 'Starter',
        slug: 'starter',
        description: 'Ayda 500g taze kahve — keşif paketi',
        monthlyWeight: 500,
        priceMonthly: 179.90,
        discountPercent: 10,
        freeShipping: true,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.subPlan.upsert({
      where: { slug: 'coffee-lover' },
      update: {},
      create: {
        name: 'Coffee Lover',
        slug: 'coffee-lover',
        description: 'Ayda 1kg taze kahve — kahve tutkunu paketi',
        monthlyWeight: 1000,
        priceMonthly: 329.90,
        discountPercent: 15,
        freeShipping: true,
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.subPlan.upsert({
      where: { slug: 'office-mini' },
      update: {},
      create: {
        name: 'Office Mini',
        slug: 'office-mini',
        description: 'Ayda 3kg — küçük ofisler için',
        monthlyWeight: 3000,
        priceMonthly: 899.90,
        discountPercent: 20,
        freeShipping: true,
        isActive: true,
        sortOrder: 3,
      },
    }),
  ]);
  console.log(`✅ ${plans.length} abonelik planı oluşturuldu`);

  // ── 12. Loyalty Accounts ──
  await prisma.loyaltyAccount.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      referralCode: 'OLP-TEST0001',
      totalPoints: 0,
      availablePoints: 0,
    },
  });
  console.log('✅ Test customer loyalty hesabı oluşturuldu');

  // ── 13. FAQ ──
  const faqs = await Promise.all([
    prisma.faqItem.upsert({
      where: { id: 'faq-kargo' },
      update: {},
      create: {
        id: 'faq-kargo',
        question: 'Kargo ücreti ne kadar?',
        answer: '500 TL ve üzeri siparişlerde kargo ücretsizdir. 500 TL altı siparişlerde kargo ücreti 29.90 TL\'dir.',
        category: 'Kargo',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.faqItem.upsert({
      where: { id: 'faq-iade' },
      update: {},
      create: {
        id: 'faq-iade',
        question: 'İade politikanız nedir?',
        answer: 'Açılmamış ürünleri 14 gün içinde iade edebilirsiniz. İade kargo ücreti bize aittir. Açılmış ürünlerde kalite sorunu varsa değişim yapılır.',
        category: 'İade',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.faqItem.upsert({
      where: { id: 'faq-abonelik' },
      update: {},
      create: {
        id: 'faq-abonelik',
        question: 'Aboneliğimi nasıl iptal ederim?',
        answer: 'Hesabınızdan abonelik bölümüne giderek istediğiniz zaman iptal edebilirsiniz. İptal işlemi bir sonraki dönemden geçerli olur.',
        category: 'Abonelik',
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.faqItem.upsert({
      where: { id: 'faq-ogutme' },
      update: {},
      create: {
        id: 'faq-ogutme',
        question: 'Öğütme derecesini seçebilir miyim?',
        answer: 'Evet! Sipariş sırasında çekirdek, filtre, espresso, Türk kahvesi, French press ve Moka pot seçeneklerinden birini tercih edebilirsiniz.',
        category: 'Ürün',
        sortOrder: 4,
        isActive: true,
      },
    }),
    prisma.faqItem.upsert({
      where: { id: 'faq-tazelik' },
      update: {},
      create: {
        id: 'faq-tazelik',
        question: 'Kahveler ne kadar taze?',
        answer: 'Tüm kahvelerimiz sipariş aldıktan sonra kavrulur. Kavurma tarihi her paketin üzerinde belirtilir. Tazelik garantisi veriyoruz.',
        category: 'Ürün',
        sortOrder: 5,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${faqs.length} FAQ oluşturuldu`);

  // ── 14. System Settings ──
  const settings = [
    { key: 'site_name', value: 'Olentia Pure', type: 'string' },
    { key: 'site_url', value: 'https://olentia.com', type: 'string' },
    { key: 'currency', value: 'TRY', type: 'string' },
    { key: 'tax_rate', value: '20', type: 'number' },
    { key: 'free_shipping_threshold', value: '500', type: 'number' },
    { key: 'shipping_cost', value: '29.90', type: 'number' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✅ ${settings.length} sistem ayarı oluşturuldu`);

  console.log('\n🎉 Seed tamamlandı!\n');
  console.log('── Giriş Bilgileri ──');
  console.log('Admin:    admin@olentia.com    / Admin2026!@#');
  console.log('Customer: test@olentia.com     / Customer2026!');
  console.log('Sales:    sales@olentia.com    / Sales2026!');
  console.log('Partner:  partner@olentia.com  / Partner2026!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
