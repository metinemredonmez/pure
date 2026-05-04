/**
 * Celalettin spec'ine göre 3 abonelik planı + Site Ayarları seed script.
 *
 * Bu script idempotent — birden fazla çalıştırılabilir, mevcut kayıtları
 * günceller (slug üzerinden upsert).
 *
 * Kullanım (sunucuda):
 *   cd /var/www/pureolentia/backend
 *   npx ts-node scripts/seed-subscription-spec.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Site Ayarları (Abonelik) ──────────────────────────────────
// Tüm planlarda kullanılan global gramaj/süre/sıklık opsiyonları
const SUBSCRIPTION_GRAMS = [
  { id: '250g', label: '250 gr', grams: 250, bags: 1 },
  { id: '500g', label: '500 gr', grams: 500, bags: 1 },
  { id: '1kg', label: '1 kg', grams: 1000, bags: 1 },
  { id: '2kg', label: '2 kg', grams: 2000, bags: 1 },
  { id: '5kg', label: '5 kg', grams: 5000, bags: 1 },
];

const SUBSCRIPTION_DURATIONS = [
  { months: 3, label: '3 ay' },
  { months: 6, label: '6 ay' },
  { months: 12, label: '12 ay' },
];

const SUBSCRIPTION_PERIODS = [
  { weeks: 4, label: 'Ayda 1' },
  { weeks: 2, label: '15 günde 1' },
];

const SUBSCRIPTION_GRINDS = [
  { kind: 'Türk', options: ['Türk'] },
  { kind: 'Espresso', options: ['Espresso', 'Moka Pot'] },
  { kind: 'Filtre', options: ['Filtre', 'French Press', 'Chemex', 'AeroPress'] },
];

// ── 3 Plan tanımı (Celalettin spec'i 1:1) ─────────────────────
const PLANS = [
  {
    slug: 'starter',
    name: 'Ev Başlangıç Paketi',
    description:
      'Evde ara sıra kahve tüketenler için idealdir. Seçtiğiniz kahve miktarı, abonelik süreniz boyunca her ay adresinize gönderilir.',
    monthlyWeight: 500, // baz aylık miktar (500g/ay)
    priceMonthly: 220, // 500g/ay için baz fiyat (₺440/kg)
    discountPercent: 10,
    sortOrder: 1,
    availableGrams: [
      { id: '250g', label: '250 gr', grams: 250, bags: 1 },
      { id: '500g', label: '500 gr', grams: 500, bags: 1 },
    ],
    availableDurations: [
      { months: 3, label: '3 ay' },
      { months: 6, label: '6 ay' },
    ],
    availablePeriods: [{ weeks: 4, label: 'Ayda 1' }],
    availableGrinds: SUBSCRIPTION_GRINDS,
    defaultGramsId: '500g',
    defaultDuration: 3,
    defaultPeriod: 4,
  },
  {
    slug: 'coffee-lover',
    name: 'Düzenli Kahve Paketi',
    description:
      'Her gün kahve tüketenler için hazırlanmıştır. Kahveniz bitmeden düzenli olarak yenisi gönderilir.',
    monthlyWeight: 1000, // baz aylık miktar (1kg/ay)
    priceMonthly: 380,
    discountPercent: 15,
    sortOrder: 2,
    availableGrams: [
      { id: '500g', label: '500 gr', grams: 500, bags: 1 },
      { id: '1kg', label: '1 kg', grams: 1000, bags: 1 },
    ],
    availableDurations: [
      { months: 3, label: '3 ay' },
      { months: 6, label: '6 ay' },
      { months: 12, label: '12 ay' },
    ],
    availablePeriods: [
      { weeks: 4, label: 'Ayda 1' },
      { weeks: 2, label: '15 günde 1' },
    ],
    availableGrinds: SUBSCRIPTION_GRINDS,
    defaultGramsId: '1kg',
    defaultDuration: 6,
    defaultPeriod: 4,
  },
  {
    slug: 'office-mini',
    name: 'Mini Ofis Paketi',
    description:
      'Küçük ofisler ve işletmeler için düzenli kahve tedarik çözümüdür. Seçtiğiniz miktar, belirlediğiniz periyotlarda düzenli olarak gönderilir.',
    monthlyWeight: 2000, // baz aylık miktar (2kg/ay)
    priceMonthly: 700,
    discountPercent: 20,
    sortOrder: 3,
    availableGrams: [
      { id: '1kg', label: '1 kg', grams: 1000, bags: 1 },
      { id: '2kg', label: '2 kg', grams: 2000, bags: 1 },
      { id: '5kg', label: '5 kg', grams: 5000, bags: 1 },
    ],
    availableDurations: [
      { months: 3, label: '3 ay' },
      { months: 6, label: '6 ay' },
      { months: 12, label: '12 ay' },
    ],
    availablePeriods: [
      { weeks: 4, label: 'Ayda 1' },
      { weeks: 2, label: '15 günde 1' },
    ],
    availableGrinds: SUBSCRIPTION_GRINDS,
    defaultGramsId: '2kg',
    defaultDuration: 6,
    defaultPeriod: 4,
  },
];

async function upsertSetting(key: string, value: any) {
  return prisma.siteSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

async function main() {
  console.log('🌱 Subscription spec seed başlıyor...\n');

  // 1) Site Ayarları (global opsiyonlar)
  console.log('📋 Site Ayarları → Abonelik global opsiyonları...');
  await upsertSetting('subscriptionGrams', SUBSCRIPTION_GRAMS);
  await upsertSetting('subscriptionDurations', SUBSCRIPTION_DURATIONS);
  await upsertSetting('subscriptionPeriods', SUBSCRIPTION_PERIODS);
  await upsertSetting('subscriptionGrinds', SUBSCRIPTION_GRINDS);
  console.log('   ✓ Gramaj: 250g, 500g, 1kg, 2kg, 5kg');
  console.log('   ✓ Süre: 3, 6, 12 ay');
  console.log('   ✓ Sıklık: Ayda 1, 15 günde 1\n');

  // 2) 3 plan upsert (slug üzerinden)
  console.log('📦 3 abonelik planı upsert ediliyor...');
  for (const p of PLANS) {
    const existing = await prisma.subPlan.findUnique({ where: { slug: p.slug } });
    const data = {
      name: p.name,
      slug: p.slug,
      description: p.description,
      monthlyWeight: p.monthlyWeight,
      priceMonthly: p.priceMonthly,
      discountPercent: p.discountPercent,
      sortOrder: p.sortOrder,
      isActive: true,
      freeShipping: true,
      availableGrams: p.availableGrams as any,
      availableDurations: p.availableDurations as any,
      availablePeriods: p.availablePeriods as any,
      availableGrinds: p.availableGrinds as any,
      defaultGramsId: p.defaultGramsId,
      defaultDuration: p.defaultDuration,
      defaultPeriod: p.defaultPeriod,
    };
    if (existing) {
      await prisma.subPlan.update({ where: { slug: p.slug }, data });
      console.log(`   ✏️  Güncellendi: ${p.name} (slug=${p.slug})`);
    } else {
      await prisma.subPlan.create({ data });
      console.log(`   ✨ Oluşturuldu: ${p.name} (slug=${p.slug})`);
    }
  }
  console.log('\n✅ Seed tamam.');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
