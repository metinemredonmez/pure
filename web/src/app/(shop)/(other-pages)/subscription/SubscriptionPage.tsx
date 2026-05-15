'use client'

import { useCart } from '@/contexts/CartContext'
import { Coffee01Icon, DeliveryTruck01Icon, GiftIcon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

/* ──────────────────────────────────────────────────────────────
   CONFIG — Pure Olentia Abonelik Sistemi
   Spec birebir uygulanmıştır.
   ────────────────────────────────────────────────────────────── */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const STEP_ICON_MAP: Record<string, any> = {
  coffee: Coffee01Icon,
  package: PackageIcon,
  truck: DeliveryTruck01Icon,
  gift: GiftIcon,
}

type CoffeeKind = 'turk' | 'espresso' | 'filtre'
type PackageId = 'ev-baslangic' | 'duzenli' | 'mini-ofis'
type Frequency = 'monthly' | 'biweekly'

interface FrequencyDef {
  value: Frequency
  label: string
  shipmentsPerMonth: number
}

interface CoffeeRule {
  label: string
  grams: number[] // izin verilen gramajlar
  /** Mini Ofis için: her gönderimdeki adet seçenekleri (1, 2, 5 → 1kg, 2kg, 5kg) */
  bagMultipliers?: number[]
}

interface PackageDef {
  id: PackageId
  name: string
  description: string
  image: string
  coffees: Record<CoffeeKind, CoffeeRule>
  durations: number[] // ay
  frequencies: FrequencyDef[]
  isOfficeBag?: boolean // Mini Ofis: kg cinsinden seçim
}

const COFFEE_KINDS: { id: CoffeeKind; label: string; categorySlugs: string[] }[] = [
  { id: 'turk', label: 'Türk Kahvesi', categorySlugs: ['turk-kahvesi', 'turk'] },
  { id: 'espresso', label: 'Espresso', categorySlugs: ['espresso'] },
  { id: 'filtre', label: 'Filtre Kahve', categorySlugs: ['filtre-kahve', 'filtre'] },
]

const PACKAGES: PackageDef[] = [
  {
    id: 'ev-baslangic',
    name: 'Ev Başlangıç Paketi',
    description: 'Az tüketimli ev kullanıcıları için',
    image: '/hero/turk-kahvesi-100gr.jpg',
    coffees: {
      turk: { label: 'Türk Kahvesi', grams: [100, 200] },
      espresso: { label: 'Espresso', grams: [250] },
      filtre: { label: 'Filtre Kahve', grams: [250] },
    },
    durations: [3, 6],
    frequencies: [{ value: 'monthly', label: 'Ayda 1', shipmentsPerMonth: 1 }],
  },
  {
    id: 'duzenli',
    name: 'Düzenli Kahve Paketi',
    description: 'Evde düzenli kahve tüketen kullanıcılar için',
    image: '/hero/brazil-santos.jpg',
    coffees: {
      turk: { label: 'Türk Kahvesi', grams: [200, 1000] },
      espresso: { label: 'Espresso', grams: [250, 1000] },
      filtre: { label: 'Filtre Kahve', grams: [250, 1000] },
    },
    durations: [3, 6, 12],
    frequencies: [
      { value: 'monthly', label: 'Ayda 1', shipmentsPerMonth: 1 },
      { value: 'biweekly', label: '15 Günde 1', shipmentsPerMonth: 2 },
    ],
  },
  {
    id: 'mini-ofis',
    name: 'Mini Ofis Paketi',
    description: 'Küçük ofisler, işletmeler ve düzenli tüketimi yüksek müşteriler için',
    image: '/hero/hediye-paketi.jpg',
    isOfficeBag: true,
    coffees: {
      turk: { label: 'Türk Kahvesi 1000g', grams: [1000], bagMultipliers: [1, 2, 5] },
      espresso: { label: 'Espresso 1000g', grams: [1000], bagMultipliers: [1, 2, 5] },
      filtre: { label: 'Filtre Kahve 1000g', grams: [1000], bagMultipliers: [1, 2, 5] },
    },
    durations: [3, 6, 12],
    frequencies: [
      { value: 'monthly', label: 'Ayda 1', shipmentsPerMonth: 1 },
      { value: 'biweekly', label: '15 Günde 1', shipmentsPerMonth: 2 },
    ],
  },
]

/** Süreye göre indirim oranları (%) — spec madde 9 */
const DURATION_DISCOUNTS: Record<number, number> = { 3: 0, 6: 5, 12: 10 }

interface ProductLite {
  id: string
  name: string
  slug: string
  price: number | string
  weight?: number | null
  category?: { slug?: string } | null
}

/* ──────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────── */

function formatPrice(v: number) {
  return `₺${v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatGrams(g: number) {
  return g >= 1000 ? `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 1)} kg` : `${g} g`
}

function parsePrice(p: number | string | undefined | null): number {
  if (p == null) return 0
  if (typeof p === 'number') return p
  const n = parseFloat(p)
  return Number.isFinite(n) ? n : 0
}

/** "1000g", "1 kg", "1000 g", "1kg" → 1000 */
function extractWeightFromText(text: string): number | null {
  if (!text) return null
  const t = text.toLowerCase().replace(/\s+/g, '')
  const kg = t.match(/(\d+(?:[.,]\d+)?)kg/)
  if (kg) return Math.round(parseFloat(kg[1].replace(',', '.')) * 1000)
  const g = t.match(/(\d+)g(r|ram)?/)
  if (g) return parseInt(g[1], 10)
  return null
}

/** Ürün listesinden (kahve türü, gramaj) → birim fiyat bul. */
function findUnitPrice(
  products: ProductLite[],
  kind: CoffeeKind,
  grams: number,
): { price: number; productName: string | null } {
  const kindDef = COFFEE_KINDS.find((k) => k.id === kind)
  if (!kindDef) return { price: 0, productName: null }
  const inCategory = products.filter((p) => {
    const slug = (p.category?.slug || '').toLowerCase()
    return kindDef.categorySlugs.includes(slug)
  })
  // Önce product.weight tam eşleşme
  let match = inCategory.find((p) => Number(p.weight) === grams)
  // Sonra isimde gramaj geçeni bul
  if (!match) {
    match = inCategory.find((p) => extractWeightFromText(p.name) === grams)
  }
  if (match) return { price: parsePrice(match.price), productName: match.name }
  return { price: 0, productName: null }
}

/* ──────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────── */

interface SubscriptionPageProps {
  heroBadge?: string
  heroTitle?: string
  heroSubtitle?: string
  heroCta?: string
  heroImage?: string
  steps?: Array<{ id: string; title: string; desc: string; icon: string }>
  faqHeading?: string
  faq?: Array<{ id: string; q: string; a: string }>
  faqCta?: string
  /** Admin /subscriptions/plans'tan gelen ad/açıklama/görsel — sıraya göre 3 pakete bind edilir */
  planOverrides?: Array<{ name?: string; description?: string; image?: string }>
}

export default function SubscriptionPage({
  heroBadge = 'Kahve Aboneliği',
  heroTitle = 'Taze Kavrulmuş Kahve <br /> ile Kapınıza Geliyoruz',
  heroSubtitle = 'Seçtiğiniz pakete göre, kahveniz belirli aralıklarla taze kavrulmuş olarak kapınıza gelir.',
  heroCta = 'Hemen Başla',
  heroImage = '',
  steps = [],
  faqHeading = 'Sıkça Sorulan Sorular',
  faq = [],
  faqCta = 'Kahveleri Keşfet',
  planOverrides = [],
}: SubscriptionPageProps = {}) {
  const router = useRouter()
  const { addItem } = useCart()

  const [products, setProducts] = useState<ProductLite[]>([])
  const [adding, setAdding] = useState(false)

  // Selection state
  const [packageId, setPackageId] = useState<PackageId | null>(null)
  const [coffeeKind, setCoffeeKind] = useState<CoffeeKind>('turk')
  const [grams, setGrams] = useState<number>(200)
  const [bagMultiplier, setBagMultiplier] = useState<number>(1) // mini-ofis için adet
  const [duration, setDuration] = useState<number>(3)
  const [frequency, setFrequency] = useState<Frequency>('monthly')

  // Ürünleri çek — fiyat kaynağı
  useEffect(() => {
    fetch(`${API_URL}/products?limit=200`)
      .then((r) => r.json())
      .then((res) => {
        const list = res?.data?.data || res?.data || []
        setProducts(Array.isArray(list) ? list : [])
      })
      .catch(() => setProducts([]))
  }, [])

  // PACKAGES + planOverrides (admin'in /subscriptions/plans'tan girdiği görsel/isim/açıklama)
  const packages = useMemo<PackageDef[]>(() => {
    return PACKAGES.map((p, idx) => {
      const o = planOverrides[idx]
      if (!o) return p
      return {
        ...p,
        name: o.name || p.name,
        description: o.description || p.description,
        image: o.image || p.image,
      }
    })
  }, [planOverrides])

  const pkg = useMemo(() => packages.find((p) => p.id === packageId) || null, [packages, packageId])
  const coffeeRule = useMemo(() => (pkg ? pkg.coffees[coffeeKind] : null), [pkg, coffeeKind])

  // Paket değişince → kahve türü + gramaj + süre + sıklık defaults
  useEffect(() => {
    if (!pkg) return
    // İlk kahve türü
    const firstKind = (Object.keys(pkg.coffees) as CoffeeKind[])[0]
    setCoffeeKind(firstKind)
    setBagMultiplier(pkg.coffees[firstKind].bagMultipliers?.[0] ?? 1)
    setGrams(pkg.coffees[firstKind].grams[0])
    setDuration(pkg.durations[0])
    setFrequency(pkg.frequencies[0].value)
  }, [pkg])

  // Kahve türü değişince → gramaj + adet sıfırla
  useEffect(() => {
    if (!coffeeRule) return
    setGrams(coffeeRule.grams[0])
    setBagMultiplier(coffeeRule.bagMultipliers?.[0] ?? 1)
  }, [coffeeKind, coffeeRule])

  // Süre paket içinde geçerli mi kontrol — değilse ilk seçeneğe çek
  useEffect(() => {
    if (!pkg) return
    if (!pkg.durations.includes(duration)) setDuration(pkg.durations[0])
    if (!pkg.frequencies.find((f) => f.value === frequency)) setFrequency(pkg.frequencies[0].value)
  }, [pkg, duration, frequency])

  /* ─── HESAPLAMALAR ─── */

  const frequencyDef = useMemo(() => {
    return pkg?.frequencies.find((f) => f.value === frequency) || { value: 'monthly' as Frequency, label: 'Ayda 1', shipmentsPerMonth: 1 }
  }, [pkg, frequency])

  const totalShipments = useMemo(() => duration * frequencyDef.shipmentsPerMonth, [duration, frequencyDef])

  // (kahve türü, gramaj) için birim fiyat
  const unitPriceInfo = useMemo(() => findUnitPrice(products, coffeeKind, grams), [products, coffeeKind, grams])
  const unitPrice = unitPriceInfo.price

  // Her gönderimdeki adet (mini-ofis için bagMultiplier, diğerleri için 1)
  const bagsPerShipment = useMemo(() => (pkg?.isOfficeBag ? bagMultiplier : 1), [pkg, bagMultiplier])

  const perShipmentGrams = useMemo(() => grams * bagsPerShipment, [grams, bagsPerShipment])
  const totalGrams = useMemo(() => perShipmentGrams * totalShipments, [perShipmentGrams, totalShipments])

  const pricePerShipment = useMemo(() => unitPrice * bagsPerShipment, [unitPrice, bagsPerShipment])

  const subtotal = useMemo(() => pricePerShipment * totalShipments, [pricePerShipment, totalShipments])

  const discountPercent = DURATION_DISCOUNTS[duration] ?? 0
  const discountAmount = useMemo(() => subtotal * (discountPercent / 100), [subtotal, discountPercent])
  const totalPrice = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount])

  const scrollToPlans = () => {
    document.getElementById('abonelik-planlari')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const choosePackage = (id: PackageId) => {
    setPackageId(id)
    setTimeout(() => {
      document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const addToCart = () => {
    if (!pkg || !coffeeRule) return
    if (unitPrice <= 0) {
      toast.error('Bu kahve türü/gramaj için ürün fiyatı bulunamadı. Lütfen başka bir seçim yapın.')
      return
    }
    const kindLabel = COFFEE_KINDS.find((k) => k.id === coffeeKind)?.label || ''
    const periodLabel = frequencyDef.label
    const bagsLabel = pkg.isOfficeBag ? `${bagMultiplier} × ${formatGrams(grams)}` : formatGrams(grams)

    setAdding(true)
    addItem({
      productId: `sub-${pkg.id}-${coffeeKind}-${grams}g-x${bagsPerShipment}-${duration}m-${frequency}`,
      name: `${pkg.name} · ${kindLabel} · ${bagsLabel} · ${duration} ay · ${periodLabel} · ${totalShipments} teslimat`,
      handle: 'subscription',
      price: totalPrice,
      quantity: 1,
      size: bagsLabel,
      image: pkg.image,
    })

    toast.success(`Abonelik sepete eklendi — ${formatPrice(totalPrice)}`, { duration: 2500 })
    setTimeout(() => {
      setAdding(false)
      setPackageId(null)
      router.push('/cart')
    }, 700)
  }

  /* ─── RENDER ─── */

  return (
    <div className="overflow-x-hidden pb-24 lg:pb-32">
      {/* HERO */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundImage: `url(${heroImage || '/hero/subscription-bg.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" aria-hidden />
        <div className="container relative z-10 py-20 text-center text-white lg:py-28">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
            {heroBadge}
          </span>
          <h1
            className="mx-auto mt-6 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl leading-tight"
            dangerouslySetInnerHTML={{ __html: heroTitle }}
          />
          <p className="mx-auto mt-5 max-w-xl text-white/70 text-sm sm:text-base">{heroSubtitle}</p>
          <button
            onClick={scrollToPlans}
            className="mt-10 inline-flex items-center justify-center rounded-full bg-white px-12 py-4 text-sm font-semibold uppercase tracking-widest text-neutral-900 shadow-lg transition hover:bg-neutral-100 hover:shadow-xl"
          >
            {heroCta}
          </button>
        </div>
      </div>

      {/* How it works — admin-managed */}
      {steps.length > 0 && (
        <div className="container relative z-10 -mt-10 lg:-mt-12">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {steps.map((step) => (
              <div key={step.id} className="rounded-2xl bg-white p-4 text-center shadow-lg sm:p-5 dark:bg-neutral-800">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/30">
                  <HugeiconsIcon icon={STEP_ICON_MAP[step.icon] || Coffee01Icon} size={20} color="currentColor" strokeWidth={1.5} />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-neutral-900 dark:text-white">{step.title}</h3>
                <p className="mt-1 text-xs text-neutral-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAKET KARTLARI */}
      <div id="abonelik-planlari" className="container mt-20 scroll-mt-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">Paket Seçin</h2>
          <p className="mt-3 text-sm text-neutral-500">
            Tüketim seviyenize uygun paketi seçin, kahve türünü ve gramajı belirleyin.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {packages.map((p) => {
            const active = packageId === p.id
            return (
              <div key={p.id} className="group">
                <div
                  className={`relative aspect-square overflow-hidden rounded-3xl bg-neutral-100 shadow-sm transition-shadow group-hover:shadow-xl dark:bg-neutral-800 ${
                    active ? 'ring-2 ring-primary-700' : ''
                  }`}
                  style={{
                    backgroundImage: `url(${p.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{p.name}</h3>
                  <p className="mt-1 text-xs text-neutral-500">{p.description}</p>
                  <button
                    onClick={() => choosePackage(p.id)}
                    className={`mt-3 flex w-full items-center justify-between border-b-2 py-2 text-sm font-semibold transition ${
                      active
                        ? 'border-primary-700 text-primary-700'
                        : 'border-neutral-900 text-neutral-900 hover:border-primary-700 hover:text-primary-700 dark:border-white dark:text-white'
                    }`}
                  >
                    <span>{active ? 'Seçildi' : 'Seç'}</span>
                    <span className={`transition ${active ? 'rotate-45' : ''}`}>+</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CONFIGURATOR */}
      {pkg && coffeeRule && (
        <div id="configurator" className="container mt-16 scroll-mt-10">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">{pkg.name}</h2>
            <p className="mt-2 text-sm text-neutral-500">{pkg.description}</p>

            {/* KAHVE TÜRÜ */}
            <div className="mt-8">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Kahve Türü</label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {COFFEE_KINDS.map((k) => {
                  const isActive = coffeeKind === k.id
                  return (
                    <button
                      key={k.id}
                      onClick={() => setCoffeeKind(k.id)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-700 hover:text-primary-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {k.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* GRAMAJ / Mini Ofis için adet */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pkg.isOfficeBag && coffeeRule.bagMultipliers ? (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Her Gönderimde Miktar</label>
                  <select
                    value={bagMultiplier}
                    onChange={(e) => setBagMultiplier(Number(e.target.value))}
                    className="mt-2 w-full border-b-2 border-neutral-900 bg-transparent py-2 text-sm font-medium focus:outline-none dark:border-white dark:text-white"
                  >
                    {coffeeRule.bagMultipliers.map((m) => (
                      <option key={m} value={m}>
                        {m} kg ({m} × 1000 g)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Her Gönderimdeki Gramaj</label>
                  <select
                    value={grams}
                    onChange={(e) => setGrams(Number(e.target.value))}
                    className="mt-2 w-full border-b-2 border-neutral-900 bg-transparent py-2 text-sm font-medium focus:outline-none dark:border-white dark:text-white"
                  >
                    {coffeeRule.grams.map((g) => (
                      <option key={g} value={g}>
                        {formatGrams(g)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Abonelik Süresi</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-2 w-full border-b-2 border-neutral-900 bg-transparent py-2 text-sm font-medium focus:outline-none dark:border-white dark:text-white"
                >
                  {pkg.durations.map((d) => (
                    <option key={d} value={d}>
                      {d} Ay
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Gönderim Sıklığı</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Frequency)}
                  className="mt-2 w-full border-b-2 border-neutral-900 bg-transparent py-2 text-sm font-medium focus:outline-none dark:border-white dark:text-white"
                >
                  {pkg.frequencies.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* AÇIKLAMA */}
            <p className="mt-6 rounded-xl bg-neutral-50 px-4 py-3 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
              Seçtiğiniz gramaj, <strong>her gönderimde</strong> adresinize teslim edilecek kahve miktarını ifade eder.
              Abonelik süreniz ve gönderim sıklığınıza göre toplam gönderim adedi otomatik hesaplanır.
            </p>

            {/* SİPARİŞ ÖZETİ */}
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/20">
              <div className="border-b border-amber-200/60 px-4 py-2.5 dark:border-amber-700/30">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
                  📦 Sipariş Özeti
                </p>
              </div>
              <div className="divide-y divide-amber-200/40 px-4 dark:divide-amber-700/20">
                <Row label="Paket" value={pkg.name} />
                <Row label="Kahve türü" value={COFFEE_KINDS.find((k) => k.id === coffeeKind)?.label || ''} />
                <Row
                  label="Her gönderimde"
                  value={pkg.isOfficeBag ? `${bagMultiplier} × ${formatGrams(grams)} = ${formatGrams(perShipmentGrams)}` : formatGrams(perShipmentGrams)}
                />
                <Row label="Abonelik süresi" value={`${duration} ay`} />
                <Row label="Gönderim sıklığı" value={frequencyDef.label} />
                <Row label="Toplam gönderim" value={`${totalShipments} adet`} />
                <Row label="Toplam kahve" value={formatGrams(totalGrams)} />
                <Row label="Gönderim başı fiyat" value={unitPrice > 0 ? formatPrice(pricePerShipment) : '—'} />
                {discountPercent > 0 && (
                  <Row
                    label={`Abonelik indirimi (%${discountPercent})`}
                    value={`− ${formatPrice(discountAmount)}`}
                    accent="green"
                  />
                )}
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Toplam Abonelik Tutarı
                  </span>
                  <span className="text-base font-bold text-amber-900 dark:text-amber-100">
                    {unitPrice > 0 ? formatPrice(totalPrice) : 'Fiyat alınamadı'}
                  </span>
                </div>
              </div>
              {unitPrice <= 0 && (
                <div className="border-t border-amber-200/60 bg-red-50 px-4 py-2.5 text-xs text-red-700 dark:border-amber-700/30 dark:bg-red-900/20 dark:text-red-300">
                  ⚠️ Bu kombinasyon için ürün fiyatı bulunamadı. Lütfen başka bir kahve türü veya gramaj seçin.
                </div>
              )}
            </div>

            <button
              onClick={addToCart}
              disabled={adding || unitPrice <= 0}
              className={`mt-6 w-full rounded-2xl py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-md transition hover:shadow-xl ${
                adding
                  ? 'bg-green-600'
                  : unitPrice <= 0
                    ? 'bg-neutral-400 cursor-not-allowed'
                    : 'bg-primary-700 hover:bg-primary-800'
              }`}
            >
              {adding
                ? '✓ Sepete Eklendi'
                : unitPrice <= 0
                  ? 'Ürün bulunamadı'
                  : `Sepete Ekle · ${formatPrice(totalPrice)}`}
            </button>

            <button
              onClick={() => setPackageId(null)}
              className="mt-4 w-full text-center text-xs text-neutral-400 hover:text-neutral-600"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <div className="container mt-24">
          <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">{faqHeading}</h2>
          <div className="mx-auto mt-10 max-w-2xl space-y-4">
            {faq.map((item) => (
              <details key={item.id} className="group rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white">
                  {item.q}
                  <svg className="h-4 w-4 shrink-0 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-neutral-500 dark:text-neutral-400">{item.a}</div>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-800"
            >
              {faqCta}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'green'
}) {
  return (
    <div className="flex justify-between py-2 text-xs">
      <span className="text-amber-900/70 dark:text-amber-200/70">{label}:</span>
      <span
        className={`font-semibold ${
          accent === 'green'
            ? 'text-emerald-700 dark:text-emerald-300'
            : 'text-amber-900 dark:text-amber-100'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
