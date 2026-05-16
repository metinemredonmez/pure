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

  // ── 11. Abonelik Planları (Spec madde 4) ──
  // Eski 'starter/coffee-lover/office-mini' planlarını sil → spec'teki 3 plana geç
  await prisma.subPlan.deleteMany({
    where: { slug: { in: ['starter', 'coffee-lover', 'office-mini'] } },
  });
  const plans = await Promise.all([
    prisma.subPlan.upsert({
      where: { slug: 'ev-baslangic' },
      update: {},
      create: {
        name: 'Ev Başlangıç Paketi',
        slug: 'ev-baslangic',
        description: 'Az tüketimli ev kullanıcıları için',
        monthlyWeight: 200,
        priceMonthly: 0, // Spec madde 5: fiyat ürün/varyasyon fiyatından gelir
        discountPercent: 0,
        freeShipping: true,
        isActive: true,
        sortOrder: 1,
        // Spec madde 4: Ev Başlangıç — Türk 100/200, Espresso 250, Filtre 250 (1000 YASAK)
        availableGrams: [
          { coffee: 'turk', grams: [100, 200] },
          { coffee: 'espresso', grams: [250] },
          { coffee: 'filtre', grams: [250] },
        ] as any,
        availableDurations: [3, 6] as any,
        availablePeriods: ['monthly'] as any,
        availableGrinds: [] as any, // bagMultipliers yok
      },
    }),
    prisma.subPlan.upsert({
      where: { slug: 'duzenli-kahve' },
      update: {},
      create: {
        name: 'Düzenli Kahve Paketi',
        slug: 'duzenli-kahve',
        description: 'Evde düzenli kahve tüketen kullanıcılar için',
        monthlyWeight: 1000,
        priceMonthly: 0,
        discountPercent: 0,
        freeShipping: true,
        isActive: true,
        sortOrder: 2,
        // Spec madde 4: Düzenli — Türk 200/1000, Espresso 250/1000, Filtre 250/1000
        availableGrams: [
          { coffee: 'turk', grams: [200, 1000] },
          { coffee: 'espresso', grams: [250, 1000] },
          { coffee: 'filtre', grams: [250, 1000] },
        ] as any,
        availableDurations: [3, 6, 12] as any,
        availablePeriods: ['monthly', 'biweekly'] as any,
        availableGrinds: [] as any,
      },
    }),
    prisma.subPlan.upsert({
      where: { slug: 'mini-ofis' },
      update: {},
      create: {
        name: 'Mini Ofis Paketi',
        slug: 'mini-ofis',
        description: 'Küçük ofisler, işletmeler ve düzenli tüketimi yüksek müşteriler için',
        monthlyWeight: 1000,
        priceMonthly: 0,
        discountPercent: 0,
        freeShipping: true,
        isActive: true,
        sortOrder: 3,
        // Spec madde 4: Mini Ofis — sadece 1000g, kg çarpanlarıyla 1/2/5 adet
        availableGrams: [
          { coffee: 'turk', grams: [1000] },
          { coffee: 'espresso', grams: [1000] },
          { coffee: 'filtre', grams: [1000] },
        ] as any,
        availableDurations: [3, 6, 12] as any,
        availablePeriods: ['monthly', 'biweekly'] as any,
        availableGrinds: [1, 2, 5] as any, // bagMultipliers: 1/2/5 kg
      },
    }),
  ]);
  console.log(`✅ ${plans.length} abonelik planı (spec) oluşturuldu`);

  // ── Süre İndirim Oranları (Spec madde 9) — site-settings'e ──
  await prisma.siteSettings.upsert({
    where: { key: 'subscriptionDurationDiscounts' },
    update: {},
    create: {
      key: 'subscriptionDurationDiscounts',
      value: [
        { months: 3, percent: 0 },
        { months: 6, percent: 5 },
        { months: 12, percent: 10 },
      ] as any,
    },
  });
  console.log(`✅ Süre indirim oranları (3:%0, 6:%5, 12:%10) eklendi`);

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

  // ── 13. FAQ kaldırıldı: FaqItem modeli silindi (orphan). ──
  // /sss sayfası DB'deki CmsPage 'sss' kaydından besleniyor.

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

  // ══════════════════════════════════════
  // 15. Website CMS — Banners, Brands, References, Machines, Site Settings, Pages
  // ══════════════════════════════════════

  // ── 15.1 Hero Banners ──
  const banners = [
    {
      title: 'Türk Kahvesi 100gr',
      subtitle: 'Taş değirmenden gelen lezzet — 100gr tekli',
      image: '/hero/turk-kahvesi-100gr.jpg',
      ctaText: 'Ürünü İncele',
      ctaUrl: '/products/turk-kahvesi-100gr',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Brazil Vila Boa — Filtre Kahve',
      subtitle: 'Brezilya menşeili filtre kahve',
      image: '/hero/brazil-santos.jpg',
      ctaText: 'Ürünü İncele',
      ctaUrl: '/products/brazil-santos',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Türk Kahvesi 200gr',
      subtitle: 'Geleneksel 200gr paket',
      image: '/hero/turk-kahvesi-200gr.jpg',
      ctaText: 'Ürünü İncele',
      ctaUrl: '/products/turk-kahvesi-200gr',
      sortOrder: 3,
      isActive: true,
    },
  ];
  for (const b of banners) {
    const existing = await prisma.heroBanner.findFirst({ where: { title: b.title } });
    if (!existing) await prisma.heroBanner.create({ data: b });
  }
  console.log(`✅ ${banners.length} hero banner oluşturuldu`);

  // ── 15.2 Brands kaldırıldı: Brand modeli silindi (orphan). ──

  // ── 15.3 References (Müşteri Yorumları) ──
  const references = [
    {
      companyName: 'Kadıköy Cafe & Bistro',
      contactPerson: 'Ahmet Yılmaz',
      sector: 'Kafe / Restoran',
      testimonial:
        'Pure Olentia ile çalışmaya başladığımızdan beri müşterilerimizin kahve yorumları tamamen değişti. Taze kavurma ve tutarlı kalite bizim için çok değerli.',
      sortOrder: 1,
      isActive: true,
    },
    {
      companyName: 'Beyoğlu Boutique Hotel',
      contactPerson: 'Zeynep Kara',
      sector: 'Otel',
      testimonial:
        'Kahvaltı servisimizde Pure Olentia kahveleri kullanıyoruz. Misafirlerimiz özellikle sabah kahvelerini övüyor. Lojistik ve tedarik mükemmel.',
      sortOrder: 2,
      isActive: true,
    },
    {
      companyName: 'Teknoloji Ofisi A.Ş.',
      contactPerson: 'Mert Bozkurt',
      sector: 'Ofis / Kurumsal',
      testimonial:
        'Ofisimizdeki 50+ çalışanımız için aylık kahve aboneliği kullanıyoruz. Her ay farklı menşei deneyimi çalışanlarımızı çok mutlu ediyor.',
      sortOrder: 3,
      isActive: true,
    },
    {
      companyName: 'Sancaktepe Kahve Evi',
      contactPerson: 'Selin Demir',
      sector: 'Specialty Cafe',
      testimonial:
        'Barista eğitimi ve ekipman danışmanlığıyla birlikte tam bir çözüm ortağı. Pure Olentia sayesinde menümüzü tamamen yeniledik.',
      sortOrder: 4,
      isActive: true,
    },
  ];
  for (const r of references) {
    const existing = await prisma.reference.findFirst({ where: { companyName: r.companyName } });
    if (!existing) await prisma.reference.create({ data: r });
  }
  console.log(`✅ ${references.length} referans oluşturuldu`);

  // ── 15.4 Machines ──
  const machines = [
    {
      name: 'La Marzocco Linea Mini',
      slug: 'la-marzocco-linea-mini',
      description: 'Ev kullanımı için tasarlanmış ticari sınıf espresso makinesi. Dual boiler, PID kontrolü.',
      images: ['/hero/brazil-santos.jpg'],
      capacity: '1 grup',
      dailyCupMin: 20,
      dailyCupMax: 60,
      drinkCount: 3,
      features: ['Dual boiler', 'PID sıcaklık kontrolü', 'Ön ısıtmalı buhar grubu', 'Ticari sınıf'],
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Rocket Appartamento',
      slug: 'rocket-appartamento',
      description: 'Kompakt tasarım, E61 grup başlığı, heat exchanger. Ev baristası için ideal.',
      images: ['/hero/turk-kahvesi-100gr.jpg'],
      capacity: '1 grup',
      dailyCupMin: 10,
      dailyCupMax: 30,
      drinkCount: 3,
      features: ['E61 grup başlığı', 'Heat exchanger', 'Rotary pompa', 'Estetik tasarım'],
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Mahlkönig EK43',
      slug: 'mahlkonig-ek43',
      description: 'Dünyanın en iyi öğütücülerinden. Filtre, espresso ve Türk kahvesi için tek ayar.',
      images: ['/hero/turk-kahvesi-200gr.jpg'],
      capacity: 'Profesyonel',
      dailyCupMin: 50,
      dailyCupMax: 500,
      drinkCount: 5,
      features: ['98mm düz burr', 'Geniş öğütme aralığı', 'Düşük retention', 'SCA standart'],
      sortOrder: 3,
      isActive: true,
    },
  ];
  for (const m of machines) {
    const existing = await prisma.machine.findUnique({ where: { slug: m.slug } });
    if (!existing) await prisma.machine.create({ data: m });
  }
  console.log(`✅ ${machines.length} makine oluşturuldu`);

  // ── 15.5 Site Settings (keys match admin/website/site-settings form) ──
  const siteSettings: Array<{ key: string; value: any }> = [
    { key: 'siteName', value: 'Pure Olentia' },
    { key: 'logo', value: '/logo.png' },
    { key: 'favicon', value: '/icon.png' },
    { key: 'footerText', value: 'Tarladan fincana izlenebilir specialty kahve deneyimi.' },
    { key: 'phone', value: '0552 462 29 54' },
    { key: 'email', value: 'info@pureolentia.com' },
    { key: 'address', value: 'Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul' },
    { key: 'mapLat', value: '40.9961' },
    { key: 'mapLng', value: '29.2309' },
    { key: 'workingHours', value: 'Pzt-Cum 09:00-18:00' },
    { key: 'facebook', value: 'https://facebook.com/pureolentia' },
    { key: 'instagram', value: 'https://instagram.com/pureolentia' },
    { key: 'twitter', value: 'https://twitter.com/pureolentia' },
    { key: 'linkedin', value: 'https://linkedin.com/company/pureolentia' },
    { key: 'youtube', value: 'https://youtube.com/@pureolentia' },
    { key: 'kvkkText', value: 'Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenmektedir.' },
    { key: 'cookiePolicy', value: 'Sitemizde deneyiminizi iyileştirmek için çerezler kullanılmaktadır.' },
    // Announcement bar — pipe-separated for rotation, or single line
    {
      key: 'announcementText',
      value:
        '300 TL üzeri siparişlerde ücretsiz kargo | Aylık kahve aboneliğinde %15 indirim | Kurumsal müşterilere özel fiyatlar | Taze kavrulmuş kahveniz kapınızda',
    },
    // Home promo sections — editable from admin
    { key: 'promo1Title', value: 'Taze kavurma, hızlı teslimat.' },
    { key: 'promo1Subtitle', value: 'Pure Olentia ile ücretsiz kargo ve abonelik indirimi fırsatı.' },
    { key: 'promo1Cta', value: 'Kahveleri İncele' },
    { key: 'promo2Title', value: 'Hediye paketi kahve setleri' },
    {
      key: 'promo2Subtitle',
      value: 'Sevdiklerinize özel kahve deneyimi hediye edin. Taze kavrulmuş, özenle paketlenmiş.',
    },
    { key: 'promo2Cta', value: 'Hediye Setleri' },
    { key: 'promo3Title', value: 'Fırsatları kaçırmayın.' },
    {
      key: 'promo3Subtitle',
      value: 'Yeni mahsul kahveler, özel indirimler ve kahve dünyasından haberler.',
    },
  ];
  for (const s of siteSettings) {
    await prisma.siteSettings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✅ ${siteSettings.length} site ayarı oluşturuldu`);

  // ── 15.6 CMS Pages (18 kurumsal / destek / yasal / içerik) ──
  const cmsPages = [
    { slug: 'ekipmanlar', title: 'Ekipmanlar', seoDescription: 'Specialty kahve demleme ekipmanları rehberi.', content: `<h2>Kahve Ekipmanları Rehberi</h2><p>Her demleme yönteminin kendine özgü bir dili vardır. Doğru ekipmanla kahvenizin karakterini ortaya çıkarabilirsiniz.</p><h3>Filtre Kahve</h3><ul><li><strong>Hario V60:</strong> Aromayı öne çıkaran koni filtre.</li><li><strong>Chemex:</strong> Kalın kağıt filtre ile berrak içim.</li><li><strong>Kalita Wave:</strong> Düz tabanlı, tutarlı demleme.</li></ul><h3>Daldırma</h3><ul><li><strong>French Press:</strong> Yoğun gövdeli, geleneksel.</li><li><strong>Aeropress:</strong> Kompakt, seyahat dostu.</li></ul><h3>Espresso ve Türk Kahvesi</h3><ul><li><strong>Espresso Makinesi</strong></li><li><strong>Moka Pot</strong></li><li><strong>Cezve</strong></li></ul>` },
    { slug: 'siparis-takibi', title: 'Sipariş Takibi', seoDescription: 'Pure Olentia siparişinizi takip edin.', content: `<h2>Siparişiniz Nerede?</h2><p>Sipariş numaranız ve e-posta adresinizle sorgulama yapabilirsiniz.</p><h3>Siparişinizin Yolculuğu</h3><ol><li><strong>Sipariş Alındı</strong></li><li><strong>Taze Kavrulur</strong> — 24 saat içinde</li><li><strong>Paketleme</strong></li><li><strong>Kargoya Teslim</strong></li><li><strong>Kapınızda</strong> — 1-3 iş günü</li></ol><p>Destek: info@pureolentia.com · 0552 462 29 54</p>` },
    { slug: 'iade-degisim', title: 'İade & Değişim', seoDescription: 'Pure Olentia iade ve değişim koşulları.', content: `<h2>İade & Değişim Koşulları</h2><p>14 gün içinde iade hakkınız vardır.</p><h3>Koşullar</h3><ul><li>Ambalajı açılmamış kahve ürünleri iade edilebilir.</li><li>Ekipmanlar orijinal ambalajında olmalıdır.</li><li>İade kargo ücreti müşteriye aittir.</li></ul><h3>Süreç</h3><ol><li>info@pureolentia.com adresine bildirim gönderin.</li><li>24 saat içinde iade kodu iletilir.</li><li>Ürünü gönderin.</li><li>7 iş günü içinde ücret iadesi yapılır.</li></ol>` },
    { slug: 'sss', title: 'Sıkça Sorulan Sorular', seoDescription: 'Pure Olentia SSS.', content: `<h2>Sıkça Sorulan Sorular</h2><h3>Siparişim ne zaman elime ulaşır?</h3><p>24 saat içinde kavrulur, 1-3 iş günü içinde kapınızda.</p><h3>Kargo ücreti ne kadar?</h3><p>300 TL üzeri siparişlerde ücretsiz kargo.</p><h3>Kahvelerinizin tazeliği nasıl?</h3><p>Tüm kahvelerimiz sipariş sonrası kavrulur.</p><h3>Abonelik nasıl çalışır?</h3><p>Plan seçin, her ay taze kahveniz kapınıza gelir.</p><h3>Ödeme yöntemleri?</h3><p>Kredi kartı, banka kartı, havale/EFT.</p>` },
    { slug: 'gizlilik-politikasi', title: 'Gizlilik Politikası', seoDescription: 'Pure Olentia KVKK gizlilik politikası.', content: `<h2>Gizlilik Politikası</h2><p>6698 sayılı KVKK uyarınca, kişisel verileriniz <strong>Pure Olentia Kahve</strong> tarafından işlenmektedir.</p><p><strong>Adres:</strong> Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul<br/><strong>E-posta:</strong> info@pureolentia.com<br/><strong>Telefon:</strong> 0552 462 29 54</p><h3>İşlenen Veriler</h3><ul><li>Kimlik ve iletişim bilgileri</li><li>Sipariş ve fatura bilgileri</li><li>Pazarlama tercihleri</li></ul><h3>Haklarınız</h3><p>KVKK Madde 11 uyarınca bilgi talep etme, düzeltme, silme haklarınız vardır.</p>` },
    { slug: 'mesafeli-satis', title: 'Mesafeli Satış Sözleşmesi', seoDescription: 'Pure Olentia mesafeli satış sözleşmesi.', content: `<h2>Mesafeli Satış Sözleşmesi</h2><p>6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca düzenlenmiştir.</p><h3>1. Taraflar</h3><p><strong>Satıcı:</strong> Pure Olentia Kahve — Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul</p><h3>2. Ödeme ve Teslimat</h3><p>Ödeme güvenli altyapı (PayTR/Iyzico) ile yapılır. Ürünler 1-3 iş günü içinde teslim edilir.</p><h3>3. Cayma Hakkı</h3><p>Alıcı 14 gün içinde cayma hakkına sahiptir. Ambalajı açılmış kahve ürünleri cayma kapsamı dışındadır.</p><h3>4. Uyuşmazlık</h3><p>Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.</p>` },
    { slug: 'kullanim-kosullari', title: 'Kullanım Koşulları', seoDescription: 'Pure Olentia web sitesi kullanım koşulları.', content: `<h2>Kullanım Koşulları</h2><p>Pure Olentia web sitesini kullanarak bu koşulları kabul etmiş sayılırsınız.</p><h3>Üyelik</h3><ul><li>18 yaşından büyük olmanız gerekir.</li><li>Hesap güvenliği size aittir.</li></ul><h3>Fikri Mülkiyet</h3><p>Tüm içerikler Pure Olentia'nın fikri mülkiyetidir.</p><h3>Değişiklikler</h3><p>Pure Olentia bu koşulları önceden bildirmeksizin güncelleme hakkına sahiptir.</p>` },
    { slug: 'cerez-politikasi', title: 'Çerez Politikası', seoDescription: 'Pure Olentia çerez politikası.', content: `<h2>Çerez Politikası</h2><p>Sitemizde çerezler kullanılmaktadır.</p><h3>Çerez Türleri</h3><ul><li><strong>Zorunlu:</strong> Site işleyişi için gereklidir.</li><li><strong>Analitik:</strong> Ziyaretçi davranışlarını anlamak için.</li><li><strong>Pazarlama:</strong> Sadece onayınızla kullanılır.</li></ul><h3>Yönetim</h3><p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz.</p>` },
    { slug: 'kvkk', title: 'KVKK Aydınlatma Metni', seoDescription: 'Pure Olentia KVKK aydınlatma metni.', content: `<h2>KVKK Aydınlatma Metni</h2><p>6698 sayılı KVKK uyarınca hazırlanmıştır.</p><h3>Veri Sorumlusu</h3><p>Pure Olentia Kahve<br/>info@pureolentia.com · 0552 462 29 54</p><h3>İşlenen Veriler</h3><ul><li>Kimlik ve iletişim bilgileri</li><li>Sipariş bilgileri</li><li>İşlem güvenliği</li></ul><h3>Haklarınız</h3><p>KVKK Madde 11 hakları ve başvuru için: info@pureolentia.com</p>` },
    { slug: 'odeme-teslimat', title: 'Ödeme & Teslimat', seoDescription: 'Pure Olentia ödeme ve teslimat bilgileri.', content: `<h2>Ödeme & Teslimat</h2><h3>Ödeme Yöntemleri</h3><ul><li>Kredi / Banka Kartı (PayTR / Iyzico)</li><li>Havale / EFT</li><li>Anlaşmalı bankalar için taksit</li></ul><h3>Kargo Süreleri</h3><ul><li><strong>İstanbul içi:</strong> 1 iş günü</li><li><strong>Büyükşehirler:</strong> 1-2 iş günü</li><li><strong>Diğer iller:</strong> 2-3 iş günü</li></ul><h3>Kargo Ücreti</h3><p>300 TL üzeri ücretsiz. Abonelik siparişlerinde her zaman ücretsiz.</p>` },
    { slug: 'toptan-satis', title: 'Toptan Satış', seoDescription: 'Pure Olentia toptan kahve satışı.', content: `<h2>Toptan Satış</h2><p>Kafe, restoran, otel ve ofisler için özel toptan fiyatlar.</p><h3>Neler Sunuyoruz</h3><ul><li>Özel toptan fiyatlar</li><li>Düzenli teslimat programı</li><li>Özel blend geliştirme</li><li>Barista eğitimi desteği</li><li>Ekipman danışmanlığı</li></ul><h3>Başvuru</h3><p>info@pureolentia.com · 0552 462 29 54</p>` },
    { slug: 'kurumsal-hediye', title: 'Kurumsal Hediye', seoDescription: 'Pure Olentia kurumsal hediye paketleri.', content: `<h2>Kurumsal Hediye Paketleri</h2><p>Çalışanlarınız ve müşterileriniz için özel kahve hediyesi.</p><h3>Neden Pure Olentia?</h3><ul><li>Taze kavrulmuş specialty kahve</li><li>Özel tasarım kutu</li><li>Logonuzla markalama</li><li>Türkiye geneline teslimat</li></ul><h3>Teklif için</h3><p>info@pureolentia.com · 0552 462 29 54</p>` },
    { slug: 'kahve-okulu', title: 'Kahve Okulu', seoDescription: 'Pure Olentia kahve okulu eğitimleri.', content: `<h2>Pure Olentia Kahve Okulu</h2><p>Specialty kahve dünyasını derinlemesine öğrenin.</p><h3>Programlar</h3><h4>Başlangıç</h4><p>Kahve 101, demleme temelleri · 1 gün</p><h4>Ev Baristası</h4><p>V60, Chemex, Aeropress, cupping · 2 gün</p><h4>Pro Barista Sertifika</h4><p>Espresso, latte art, SCA hazırlığı · 5 gün</p><h3>Kurumsal Eğitim</h3><p>Ekibinize özel eğitim için: info@pureolentia.com</p>` },
    { slug: 'kampanyalar', title: 'Kampanyalar', seoDescription: 'Pure Olentia güncel kampanyalar.', content: `<h2>Güncel Kampanyalar</h2><h3>🎁 Abonelik İndirimi</h3><p>Aylık abonelikte <strong>%15 indirim</strong>.</p><h3>🚚 Ücretsiz Kargo</h3><p>300 TL üzeri siparişlerde ücretsiz kargo.</p><h3>☕ Hediye Setleri</h3><p>3'lü Türk Kahvesi setinde özel fiyat.</p><h3>🏢 Kurumsal İndirim</h3><p>10 kg ve üzeri toptan fiyat.</p>` },
    { slug: 'menseiler', title: 'Menşei Hikayeleri', seoDescription: 'Pure Olentia kahvelerinin geldiği topraklar.', content: `<h2>Her Fincanın Arkasında Bir Hikaye</h2><h3>🇪🇹 Etiyopya</h3><p>Kahvenin anavatanı. Çiçeksi, meyvemsi, karmaşık aromalar.</p><h3>🇨🇴 Kolombiya</h3><p>Dengeli, tatlı, kolay içilir. Karamel ve fındık notaları.</p><h3>🇧🇷 Brezilya</h3><p>Gövdeli ve zengin. Çikolata ve fındık. Espresso için ideal.</p><h3>🇰🇪 Kenya</h3><p>Parlak ve asidik. Yoğun meyve notaları.</p><h3>🇬🇹 Guatemala</h3><p>Volkanik topraklar. Baharatlı ve çikolatalı.</p>` },
    { slug: 'surdurulebilirlik', title: 'Sürdürülebilirlik', seoDescription: 'Pure Olentia sürdürülebilir kahve anlayışı.', content: `<h2>Sürdürülebilir Kahve</h2><h3>🌱 Direct Trade</h3><p>Doğrudan üreticiden alıyoruz. Çiftçi hak ettiği fiyatı alır.</p><h3>🌍 Çevre</h3><ul><li>Gölge altı yetiştirme</li><li>Geri dönüştürülebilir ambalaj</li><li>Karbon ayak izi azaltımı</li></ul><h3>👥 Sosyal</h3><ul><li>Kadın kooperatiflerine destek</li><li>Çocuk işçiliğine sıfır tolerans</li><li>Çiftçi çocukları eğitim desteği</li></ul>` },
    { slug: 'kahve-sozlugu', title: 'Kahve Sözlüğü', seoDescription: 'Kahve terimleri sözlüğü.', content: `<h2>Kahve Sözlüğü</h2><ul><li><strong>Arabica:</strong> En kaliteli kahve türü.</li><li><strong>Bloom:</strong> Demleme başında CO₂ çıkışı.</li><li><strong>Body:</strong> Kahvenin ağızda dolgunluğu.</li><li><strong>Crema:</strong> Espresso üzerindeki altın köpük.</li><li><strong>Cupping:</strong> Kahve tadım metodolojisi.</li><li><strong>Direct Trade:</strong> Doğrudan ticaret.</li><li><strong>Extraction:</strong> Kahve özünün suya geçmesi.</li><li><strong>Microlot:</strong> Tek bahçeden özel kahve.</li><li><strong>Single Origin:</strong> Tek menşei kahve.</li><li><strong>Specialty:</strong> 80+ puan alan premium sınıf.</li><li><strong>Terroir:</strong> Yetişme koşullarının etkisi.</li></ul>` },
    { slug: 'demleme-rehberi', title: 'Demleme Rehberi', seoDescription: 'V60, Chemex, French Press, Aeropress, Cezve tarifleri.', content: `<h2>Demleme Rehberi</h2><h3>☕ V60</h3><p><strong>Oran:</strong> 15g / 250ml (1:16) · <strong>Öğütme:</strong> Orta-ince · <strong>Süre:</strong> 2:30-3:00</p><h3>⚗️ Chemex</h3><p><strong>Oran:</strong> 30g / 500ml (1:17) · <strong>Öğütme:</strong> Orta · <strong>Süre:</strong> 4-5 dk</p><h3>🫗 French Press</h3><p><strong>Oran:</strong> 30g / 500ml · <strong>Öğütme:</strong> İri · <strong>Süre:</strong> 4 dk</p><h3>🚀 Aeropress</h3><p><strong>Oran:</strong> 15g / 220ml · <strong>Öğütme:</strong> Orta-ince · <strong>Süre:</strong> 2 dk</p><h3>🇹🇷 Cezve</h3><p>1 fincan su + 1.5 tatlı kaşığı toz kahve · Düşük ateş · 4-5 dk</p>` },
  ];
  for (const p of cmsPages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        sections: [{ type: 'html', content: p.content }],
        isPublished: true,
        seoTitle: `${p.title} - Pure Olentia`,
        seoDescription: p.seoDescription,
      },
    });
  }
  console.log(`✅ ${cmsPages.length} CMS sayfası oluşturuldu`);

  // ── 15.7 Blog Categories + Posts ──
  const blogCategoriesData = [
    { name: 'Kahve Rehberi', slug: 'kahve-rehberi' },
    { name: 'Demleme', slug: 'demleme' },
    { name: 'Menşei', slug: 'mensei' },
    { name: 'Kahve Bilimi', slug: 'kahve-bilimi' },
    { name: 'Ekipman', slug: 'ekipman' },
    { name: 'Sürdürülebilirlik', slug: 'surdurulebilirlik' },
  ];
  for (const c of blogCategoriesData) {
    await prisma.blogCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  const catMap: Record<string, string> = {};
  for (const c of await prisma.blogCategory.findMany()) {
    catMap[c.slug] = c.id;
  }
  console.log(`✅ ${blogCategoriesData.length} blog kategorisi oluşturuldu`);

  const blogPostsData = [
    {
      slug: 'specialty-kahve-nedir-rehber',
      title: 'Specialty Kahve Nedir? Yeni Başlayanlar İçin Rehber',
      excerpt:
        'Specialty kahve, 80 puan ve üzeri alan, tarladan fincana kadar her aşaması izlenebilir kahvelere verilen isimdir. Bu rehberde temel kavramları ve demleme yöntemlerini keşfedin.',
      content: `<p>Specialty kahve, Specialty Coffee Association (SCA) tarafından 100 puan üzerinden 80 ve üzeri puan alan kahvelere verilen isimdir. Bu puanlama; aroma, asidite, gövde, tatlılık, denge ve son tat gibi pek çok kriteri kapsar.</p>
<h3>Specialty kahveyi diğerlerinden ayıran nedir?</h3>
<p>Bir specialty kahvenin en önemli özelliği <strong>izlenebilirlik</strong>tir. Hangi ülkeden, hangi çiftlikten, hangi yükseklikten geldiğini, hatta kim tarafından toplandığını bile bilirsiniz.</p>
<ol>
<li>Tek menşe (single origin) üretim</li>
<li>El ile hasat ve seçici işleme</li>
<li>Taze kavurma, taze tüketim (ideali 2-4 hafta)</li>
<li>Doğru demleme yöntemiyle maksimum aroma</li>
</ol>
<p>Specialty kahveye yeni başlıyorsanız öneriniz orta kavrum bir Colombia Supremo veya Brezilya Santos ile başlamaktır.</p>`,
      coverImage: '/blog/blog1.jpg',
      categorySlug: 'kahve-rehberi',
      tags: ['specialty', 'rehber', 'kahve kültürü'],
    },
    {
      slug: 'v60-pour-over-nasil-yapilir',
      title: 'V60 ile Mükemmel Pour-Over Nasıl Yapılır?',
      excerpt:
        'Pour-over yöntemi ile kahvenizin tüm aroma notalarını ortaya çıkarabilirsiniz. Su sıcaklığından öğütme boyutuna, adım adım V60 demleme rehberi.',
      content: `<p>V60, Japon Hario firması tarafından tasarlanan ve dünya genelinde en popüler manuel demleme yöntemlerinden biridir.</p>
<h3>İhtiyacınız olan ekipmanlar</h3>
<ul>
<li>Hario V60 filtre</li>
<li>V60 kağıt filtre</li>
<li>Kuğu boyunlu ibrik</li>
<li>Hassas terazi</li>
<li>Orta-ince öğütülmüş taze kahve</li>
</ul>
<h3>Adım adım V60 demleme</h3>
<ol>
<li><strong>Oran:</strong> 15 gram kahve, 250 ml su (1:16.5)</li>
<li><strong>Su sıcaklığı:</strong> 92-94°C</li>
<li><strong>Bloom:</strong> 30 ml su ile 30 saniye</li>
<li><strong>Ana dökme:</strong> Merkezden dışa spiral hareketlerle</li>
<li><strong>Toplam süre:</strong> 2:30 - 3:00 dakika</li>
</ol>`,
      coverImage: '/blog/blog2.jpg',
      categorySlug: 'demleme',
      tags: ['v60', 'pour-over', 'demleme'],
    },
    {
      slug: 'etiyopya-kahvenin-anavatani',
      title: 'Etiyopya: Kahvenin Anavatanını Keşfedin',
      excerpt:
        'Kahvenin doğduğu topraklar olan Etiyopya, çiçeksi ve meyvemsi notalarıyla dünyada eşsiz bir yere sahiptir. Yirgacheffe, Sidamo ve Guji bölgelerinin hikayesi.',
      content: `<p>Kahve ağacının doğal olarak yetiştiği tek yer Etiyopya'nın yüksek platolarıdır.</p>
<h3>Öne çıkan bölgeler</h3>
<h4>Yirgacheffe</h4>
<p>Çiçeksi, narenciye ve bergamot notalarıyla tanınır. İnce gövdeli ve parlak asiditeli kahveleriyle öne çıkar.</p>
<h4>Sidamo</h4>
<p>Yaban mersini, çikolata ve tatlı meyve notalarına sahiptir. Doğal işleme ile özellikle karakterlidir.</p>
<h4>Guji</h4>
<p>Tropik meyve ve şeker kamışı tatlılığıyla yarışmalarda üst sıralara yerleşmektedir.</p>`,
      coverImage: '/blog/blog3.jpg',
      categorySlug: 'mensei',
      tags: ['etiyopya', 'yirgacheffe', 'menşei'],
    },
    {
      slug: 'kahve-isleme-yontemleri',
      title: 'Kahvede İşleme Yöntemleri: Washed, Natural ve Honey',
      excerpt:
        'Kahve çekirdeğinin işlenme şekli, fincanınızdaki tadı doğrudan etkiler. Yıkanmış, doğal ve bal işleme yöntemlerinin farklarını ve aroma profillerini öğrenin.',
      content: `<p>Kahve meyvesi toplandıktan sonra çekirdeğin meyveden ayrılması gerekir. Bu süreç <strong>işleme yöntemi</strong> olarak adlandırılır.</p>
<h3>Washed (Yıkanmış) İşleme</h3>
<p>Meyve kabuğu hemen soyulur, çekirdekler fermantasyon tanklarında bekletilir. Sonuç: temiz, parlak, asiditesi yüksek bir kahve.</p>
<h3>Natural (Doğal) İşleme</h3>
<p>Çekirdek meyvenin içinde güneşte kurutulur. Meyvenin şekeri çekirdeğe geçer. Sonuç: yoğun, meyveli, şaraplı, tatlı bir profil.</p>
<h3>Honey (Bal) İşleme</h3>
<p>Kabuk soyulur ama çekirdeğin üzerindeki yapışkan tabaka bırakılır. Tatlılık ve gövde dengesi.</p>`,
      coverImage: '/blog/blog4.jpg',
      categorySlug: 'kahve-bilimi',
      tags: ['işleme', 'washed', 'natural', 'honey'],
    },
    {
      slug: 'evde-espresso-ekipman-secimi',
      title: 'Evde Espresso: Doğru Ekipman Seçimi',
      excerpt:
        'Ev ortamında profesyonel kalitede espresso yapmak artık mümkün. Bütçenize ve ihtiyacınıza göre doğru öğütücü ve espresso makinesi nasıl seçilir?',
      content: `<p>Evde profesyonel kalitede espresso çekmek artık bir hayal değil.</p>
<h3>Öğütücü: Espresso'nun kalbi</h3>
<p>Espresso makinenizden önce iyi bir öğütücüye yatırım yapın.</p>
<h3>Espresso makinesi seçimi</h3>
<ol>
<li><strong>Yarı otomatik:</strong> Baristanın müdahalesini gerektirir</li>
<li><strong>Tam otomatik:</strong> Tek tuşla espresso, pratik</li>
<li><strong>Manuel kol:</strong> Klasik deneyim, yüksek zanaat</li>
</ol>`,
      coverImage: '/blog/blog5.jpg',
      categorySlug: 'ekipman',
      tags: ['espresso', 'ekipman', 'ev baristası'],
    },
    {
      slug: 'surdurulebilir-kahve-izlenebilirlik',
      title: 'Sürdürülebilir Kahve: Tarladan Fincana İzlenebilirlik',
      excerpt:
        'Pure Olentia olarak kahvenin her aşamasını izlenebilir kılıyoruz. Çiftçiden kavurmacıya, lojistikten fincanınıza kadar tüm süreç şeffaf.',
      content: `<p>Pure Olentia'da kahvenin sadece fincanda değil, tarlada da iyi olmasını önemsiyoruz.</p>
<h3>Direct Trade — doğrudan ticaret</h3>
<p>Kahvemizi doğrudan üreticiden satın alıyoruz. Çiftçi piyasa fiyatının 2-3 katı prim alıyor.</p>
<h3>İzlenebilirlik</h3>
<ul>
<li>Her paketin üzerinde hasat tarihi</li>
<li>Çiftçi/kooperatif adı ve fotoğrafı</li>
<li>Yükseklik, çeşit (varietal) ve işleme yöntemi</li>
<li>Kavurma tarihi ve tavsiye edilen tüketim aralığı</li>
</ul>`,
      coverImage: '/blog/blog6.jpg',
      categorySlug: 'surdurulebilirlik',
      tags: ['sürdürülebilirlik', 'izlenebilirlik', 'direct trade'],
    },
  ];

  for (const p of blogPostsData) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.coverImage,
        categoryId: catMap[p.categorySlug],
        tags: p.tags,
        isPublished: true,
        publishedAt: new Date(),
        seoTitle: `${p.title} | Pure Olentia`,
        seoDescription: p.excerpt,
      },
    });
  }
  console.log(`✅ ${blogPostsData.length} blog yazısı oluşturuldu`);

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
