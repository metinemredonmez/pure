'use client'

import { useCart } from '@/contexts/CartContext'
import { Coffee01Icon, DeliveryTruck01Icon, GiftIcon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

/* ---------------- Config ---------------- */

type CategoryDef = {
  id: string
  slugs: string[]
  title: string
  name: string
  fallbackImage: string
  grind: string
  planId?: string
  basePrice?: number
  monthlyWeight?: number
  discountPercent?: number
}

const FALLBACK_IMAGES = ['/hero/turk-kahvesi-100gr.jpg', '/hero/brazil-santos.jpg', '/hero/hediye-paketi.jpg']

/** Derive category metadata from plan name */
function inferCategoryFromName(name: string): { slugs: string[]; grind: string } {
  const n = name.toLowerCase()
  if (n.includes('türk') || n.includes('turk')) return { slugs: ['turk-kahvesi', 'turk'], grind: 'Türk' }
  if (n.includes('espresso')) return { slugs: ['espresso'], grind: 'Espresso' }
  if (n.includes('filtre') || n.includes('filter')) return { slugs: ['filtre-kahve', 'filtre'], grind: 'Filtre' }
  return { slugs: [], grind: 'Filtre' }
}

const DURATIONS = [
  { months: 3, label: '3 ay boyunca' },
  { months: 6, label: '6 ay boyunca' },
  { months: 12, label: '12 ay boyunca' },
]

const PERIODS = [
  { weeks: 1, label: 'Haftada 1' },
  { weeks: 2, label: '2 haftada 1' },
  { weeks: 4, label: 'Ayda 1' },
]

const DEFAULT_GRAMS = [
  { id: '1x250', label: '1 x 250 g', bags: 1, grams: 250 },
  { id: '2x250', label: '2 x 250 g', bags: 2, grams: 500 },
  { id: '3x250', label: '3 x 250 g', bags: 3, grams: 750 },
  { id: '1x1000', label: '1 x 1 kg', bags: 1, grams: 1000 },
]

const DEFAULT_BASE_PRICES: Record<string, number> = {
  'turk-kahvesi': 180,
  espresso: 180,
  'filtre-kahve': 200,
}

const GRINDS_BY_KIND: Record<string, string[]> = {
  Türk: ['Türk'],
  Espresso: ['Espresso', 'Moka Pot'],
  Filtre: ['Filtre', 'French Press', 'Chemex', 'AeroPress'],
}

/* ---------------- Types ---------------- */

interface Product {
  id: string
  name: string
  slug: string
  price: number | string
  images?: { url: string }[]
  category?: { slug: string; name: string }
}

interface Plan {
  id: string
  name: string
  priceMonthly: number | string
  weightGrams?: number
  frequencyWeeks?: number
  discountPercent?: number
  isActive?: boolean
}

/* ---------------- Helpers ---------------- */

function formatPrice(v: number | string) {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v || 0)
  return `₺${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/* ---------------- Page ---------------- */

export default function SubscriptionPage() {
  const router = useRouter()
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  // Admin-configurable
  const [gramsList, setGramsList] = useState(DEFAULT_GRAMS)
  const [basePrices, setBasePrices] = useState<Record<string, number>>(DEFAULT_BASE_PRICES)
  const [durationsList, setDurationsList] = useState(DURATIONS)
  const [periodsList, setPeriodsList] = useState(PERIODS)
  const [grindsMap, setGrindsMap] = useState<Record<string, string[]>>(GRINDS_BY_KIND)

  // Per-category configurator state (map id → state)
  const [duration, setDuration] = useState<number>(3)
  const [period, setPeriod] = useState<number>(2)
  const [gramsOpt, setGramsOpt] = useState<string>('1x250')
  const [grind, setGrind] = useState<string>('Filtre')
  const [selectedCoffees, setSelectedCoffees] = useState<string[]>([])

  useEffect(() => {
    fetch(`${API_URL}/products?limit=100`)
      .then((r) => r.json())
      .then((res) => {
        const list = res?.data?.data || res?.data || []
        setProducts(Array.isArray(list) ? list : [])
      })
      .catch(() => {})

    fetch(`${API_URL}/subscription/plans`)
      .then((r) => r.json())
      .then((res) => {
        const data = res?.data?.data || res?.data || []
        setPlans(Array.isArray(data) ? data.filter((p: any) => p.isActive !== false) : [])
      })
      .catch(() => {})

    // Admin-configurable gramaj + base prices
    fetch(`${API_URL}/public/site-settings`)
      .then((r) => r.json())
      .then((res) => {
        const s = res?.data || res || {}
        if (Array.isArray(s.subscriptionGrams) && s.subscriptionGrams.length) {
          const normalized = s.subscriptionGrams
            .map((g: any) => {
              const grams = Number(g.grams)
              const bags = Number(g.bags) || 1
              if (!grams || grams <= 0) return null
              const label =
                g.label || (grams >= 1000 ? `${bags} x ${grams / 1000} kg` : `${bags} x ${grams} g`)
              const id = g.id || `${bags}x${grams}`
              return { id, label, grams, bags }
            })
            .filter(Boolean)
          if (normalized.length) setGramsList(normalized)
        }
        if (s.subscriptionBasePrices && typeof s.subscriptionBasePrices === 'object') {
          setBasePrices({ ...DEFAULT_BASE_PRICES, ...s.subscriptionBasePrices })
        }
        if (Array.isArray(s.subscriptionDurations) && s.subscriptionDurations.length) {
          const normalized = s.subscriptionDurations
            .map((d: any) => {
              const months = Number(d.months)
              if (!months || months <= 0) return null
              return { months, label: d.label || `${months} ay boyunca` }
            })
            .filter(Boolean) as typeof DURATIONS
          if (normalized.length) setDurationsList(normalized)
        }
        if (Array.isArray(s.subscriptionPeriods) && s.subscriptionPeriods.length) {
          const normalized = s.subscriptionPeriods
            .map((p: any) => {
              const weeks = Number(p.weeks)
              if (!weeks || weeks <= 0) return null
              return { weeks, label: p.label || `${weeks} haftada 1` }
            })
            .filter(Boolean) as typeof PERIODS
          if (normalized.length) setPeriodsList(normalized)
        }
        if (Array.isArray(s.subscriptionGrinds) && s.subscriptionGrinds.length) {
          const map: Record<string, string[]> = {}
          s.subscriptionGrinds.forEach((g: any) => {
            if (g && typeof g.kind === 'string' && Array.isArray(g.options) && g.options.length) {
              map[g.kind] = g.options.filter((o: any) => typeof o === 'string' && o.trim())
            }
          })
          if (Object.keys(map).length) setGrindsMap(map)
        }
      })
      .catch(() => {})
  }, [])

  // Reset gramsOpt when gramsList changes (admin values loaded)
  useEffect(() => {
    if (gramsList.length && !gramsList.find((g) => g.id === gramsOpt)) {
      setGramsOpt(gramsList[0].id)
    }
  }, [gramsList, gramsOpt])

  // Reset duration/period if admin list changes and current value isn't available
  useEffect(() => {
    if (durationsList.length && !durationsList.find((d) => d.months === duration)) {
      setDuration(durationsList[0].months)
    }
  }, [durationsList, duration])

  useEffect(() => {
    if (periodsList.length && !periodsList.find((p) => p.weeks === period)) {
      setPeriod(periodsList[0].weeks)
    }
  }, [periodsList, period])

  const scrollToPlans = () => {
    document.getElementById('abonelik-planlari')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Categories derived from admin plans (fully admin-managed)
  const categories: CategoryDef[] = useMemo(() => {
    if (!plans.length) return []
    const sorted = [...plans].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    return sorted.map((p: any, i: number) => {
      const inferred = inferCategoryFromName(p.name || '')
      return {
        id: p.slug || p.id,
        slugs: inferred.slugs.length ? inferred.slugs : [p.slug].filter(Boolean),
        title: `Abonelik No.0${i + 1}`,
        name: p.name,
        fallbackImage: (p as any).image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
        grind: inferred.grind,
        planId: p.id,
        basePrice: Number(p.priceMonthly) || 0,
        monthlyWeight: Number(p.monthlyWeight ?? p.weightGrams ?? 250) || 250,
        discountPercent: Number((p as any).discountPercent) || 0,
      }
    })
  }, [plans])

  const cat = categories.find((c) => c.id === selectedCategory) || null

  // Products of selected category
  const categoryProducts = useMemo(() => {
    if (!cat) return []
    return products.filter((p) => {
      const slug = p.category?.slug?.toLowerCase() || ''
      return cat.slugs.includes(slug)
    })
  }, [cat, products])

  // Base price per 250g bag — admin plan fiyatı/gramajı normalize edilir
  const basePricePerBag = useMemo(() => {
    if (!cat) return 0
    // Plan'ın aylık fiyatını, aylık gramaj/250'ye bölerek 250g başı birim fiyat bul
    if (cat.basePrice && cat.monthlyWeight) {
      const unitScale = cat.monthlyWeight / 250
      if (unitScale > 0) return cat.basePrice / unitScale
    }
    // Fallback: admin site-settings baz fiyat
    const admin = basePrices[cat.id]
    if (admin && admin > 0) return admin
    return DEFAULT_BASE_PRICES[cat.id] || 200
  }, [cat, basePrices])

  // Periods per month
  const periodsPerMonth = useMemo(() => (period === 4 ? 1 : period === 2 ? 2 : 4), [period])

  const gramsInfo = gramsList.find((g) => g.id === gramsOpt) || gramsList[0]

  const totalPrice = useMemo(() => {
    // bags per shipment * shipments per month * months * price per bag
    const monthsTotal = duration
    const bagsPerShipment = gramsInfo.bags
    const gramScale = gramsInfo.grams / 250 // 250g baseline
    return basePricePerBag * bagsPerShipment * gramScale * periodsPerMonth * monthsTotal
  }, [basePricePerBag, duration, gramsInfo, periodsPerMonth])

  const pricePerShipment = useMemo(() => {
    return basePricePerBag * gramsInfo.bags * (gramsInfo.grams / 250)
  }, [basePricePerBag, gramsInfo])

  const chooseCategory = (id: string) => {
    const c = categories.find((x) => x.id === id)
    if (!c) return
    setSelectedCategory(id)
    setGrind(grindsMap[c.grind]?.[0] || c.grind)
    setSelectedCoffees([])
    setTimeout(() => {
      document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const toggleCoffee = (id: string) => {
    setSelectedCoffees((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const addToCart = () => {
    if (!cat) return
    const chosenNames =
      selectedCoffees.length > 0
        ? categoryProducts
            .filter((p) => selectedCoffees.includes(p.id))
            .map((p) => p.name)
            .join(', ')
        : 'Sürpriz (bariston seçimi)'

    const durLabel = durationsList.find((d) => d.months === duration)?.label
    const perLabel = periodsList.find((p) => p.weeks === period)?.label
    const totalShipments = duration * periodsPerMonth

    setAdding(true)
    const shortCoffees = selectedCoffees.length > 0 ? ` · ${chosenNames.length > 60 ? chosenNames.slice(0, 57) + '...' : chosenNames}` : ''
    addItem({
      productId: `sub-${cat.id}-${duration}m-${period}w-${gramsOpt}-${grind}`,
      name: `${cat.title} — ${cat.name} · ${durLabel} · ${perLabel} · ${gramsInfo.label} · ${grind}${shortCoffees} · ${totalShipments} teslimat`,
      handle: 'subscription',
      price: totalPrice,
      quantity: 1,
      size: gramsInfo.label,
    })

    toast.success(`Abonelik sepete eklendi — tüm ${duration} ay tek ödemede`, { duration: 2500 })
    setTimeout(() => {
      setAdding(false)
      setSelectedCategory(null)
      router.push('/cart')
    }, 700)
  }

  /* ---------------- Render ---------------- */

  return (
    <div className="overflow-x-hidden pb-24 lg:pb-32">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-800 via-amber-900 to-primary-950">
        <div className="container py-20 text-center text-white lg:py-28">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
            Kahve Aboneliği
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl leading-tight">
            Taze Kavrulmuş Kahve <br /> ile Kapınıza Geliyoruz
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70 text-sm sm:text-base">
            Kahveleri hafta başında kavurup, ertesi gün kargoya veriyoruz. Seçtiğiniz süre boyunca
            taze kahvenizi sabit tutacak şekilde hareket ediyoruz.
          </p>
          <button
            onClick={scrollToPlans}
            className="mt-10 inline-flex items-center justify-center rounded-full bg-white px-12 py-4 text-sm font-semibold uppercase tracking-widest text-neutral-900 shadow-lg transition hover:bg-neutral-100 hover:shadow-xl"
          >
            Abone Ol
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="container -mt-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            { icon: Coffee01Icon, title: 'Plan Seçin', desc: 'Size uygun paketi seçin' },
            { icon: PackageIcon, title: 'Taze Kavrulsun', desc: 'Sipariş üzerine kavrulur' },
            { icon: DeliveryTruck01Icon, title: 'Kapınıza Gelsin', desc: 'Ücretsiz hızlı kargo' },
            { icon: GiftIcon, title: 'Her Ay Yeni Lezzet', desc: 'Farklı menşeiler' },
          ].map((step, i) => (
            <div key={i} className="rounded-2xl bg-white p-4 text-center shadow-lg sm:p-5 dark:bg-neutral-800">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/30">
                <HugeiconsIcon icon={step.icon} size={20} color="currentColor" strokeWidth={1.5} />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-neutral-900 dark:text-white">{step.title}</h3>
              <p className="mt-1 text-xs text-neutral-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Cards — admin plans'tan dinamik */}
      <div id="abonelik-planlari" className="container mt-20 scroll-mt-10">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
            Henüz aktif abonelik planı yok. Admin panelden ekleyin.
          </div>
        ) : (
        <div className={`grid gap-6 ${categories.length >= 3 ? 'md:grid-cols-3' : categories.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-md mx-auto'}`}>
          {categories.map((c) => {
            const active = selectedCategory === c.id
            return (
              <div key={c.id} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-neutral-100 shadow-sm transition-shadow group-hover:shadow-xl dark:bg-neutral-800">
                  <Image
                    src={c.fallbackImage}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{c.title}</h3>
                  <p className="mt-0.5 text-sm text-neutral-500">{c.name}</p>
                  <button
                    onClick={() => chooseCategory(c.id)}
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
        )}
      </div>

      {/* Configurator */}
      {cat && (
        <div id="configurator" className="container mt-16 scroll-mt-10">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
              {cat.title}
              <br />
              {cat.name}
            </h2>

            <div className="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">
              {formatPrice(totalPrice)}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {durationsList.find((d) => d.months === duration)?.label} · sevkiyat başı {formatPrice(pricePerShipment)}
            </p>

            {/* Süre + Peryot */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Süre</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-2 w-full border-b-2 border-neutral-900 bg-transparent py-2 text-sm font-medium focus:outline-none dark:border-white dark:text-white"
                >
                  {durationsList.map((d) => (
                    <option key={d.months} value={d.months}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Peryot</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className="mt-2 w-full border-b-2 border-neutral-900 bg-transparent py-2 text-sm font-medium focus:outline-none dark:border-white dark:text-white"
                >
                  {periodsList.map((p) => (
                    <option key={p.weeks} value={p.weeks}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kahve seçimi */}
            <div className="mt-8">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Kahve</label>
              {categoryProducts.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-500 italic">
                  Bu kategoride henüz ürün yok — sürpriz paket gönderilecek.
                </p>
              ) : (
                <>
                  <div className="mt-3 space-y-2.5">
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCoffees.length === 0}
                        onChange={() => setSelectedCoffees([])}
                        className="mt-1 h-4 w-4 accent-primary-700"
                      />
                      <span className="font-medium text-neutral-900 dark:text-white">
                        Sürpriz <span className="text-neutral-500 font-normal">(bariston seçimi)</span>
                      </span>
                    </label>
                    {categoryProducts.map((p) => (
                      <label key={p.id} className="flex items-start gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCoffees.includes(p.id)}
                          onChange={() => toggleCoffee(p.id)}
                          className="mt-1 h-4 w-4 accent-primary-700"
                        />
                        <span className="text-neutral-800 dark:text-neutral-200">{p.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-neutral-400 italic">
                    * Aboneliği başlattığınız tarihte, yeni hasat edilen kahve hangisi ise o gönderilmektedir.
                  </p>
                </>
              )}
            </div>

            {/* Gramaj + Çekme */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Gramaj</label>
                <select
                  value={gramsOpt}
                  onChange={(e) => setGramsOpt(e.target.value)}
                  className="mt-2 w-full border-b-2 border-neutral-900 bg-transparent py-2 text-sm font-medium focus:outline-none dark:border-white dark:text-white"
                >
                  {gramsList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Çekme Derecesi</label>
                <select
                  value={grind}
                  onChange={(e) => setGrind(e.target.value)}
                  className="mt-2 w-full border-b-2 border-neutral-900 bg-transparent py-2 text-sm font-medium focus:outline-none dark:border-white dark:text-white"
                >
                  {(grindsMap[cat.grind] || ['Filtre']).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-700/40">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40">
                  ☕
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    {duration} Aylık Abonelik — Tek Ödeme
                  </p>
                  <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80 leading-snug">
                    Toplam <strong>{formatPrice(totalPrice)}</strong> tek seferde ödenir. Sonrasında{' '}
                    her {period === 4 ? 'ay' : `${period} haftada bir`} taze kavrulmuş kahveniz adresinize kargolanır
                    (toplam {duration * periodsPerMonth} teslimat).
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={addToCart}
              disabled={adding}
              className={`mt-6 w-full rounded-2xl py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-md transition hover:shadow-xl ${
                adding ? 'bg-green-600' : 'bg-primary-700 hover:bg-primary-800'
              }`}
            >
              {adding ? '✓ Sepete Eklendi' : `Sepete Ekle · ${formatPrice(totalPrice)}`}
            </button>

            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-4 w-full text-center text-xs text-neutral-400 hover:text-neutral-600"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* SSS */}
      <div className="container mt-24">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Sıkça Sorulan Sorular</h2>
        <div className="mx-auto mt-10 max-w-2xl space-y-4">
          {[
            { q: 'Aboneliğimi istediğim zaman iptal edebilir miyim?', a: 'Evet, aboneliğinizi dilediğiniz zaman hesabınızdan iptal edebilirsiniz.' },
            { q: 'Kahve tercihimi değiştirebilir miyim?', a: 'Her teslimat öncesi tercihlerinizi değiştirebilirsiniz.' },
            { q: 'Teslimat ne zaman yapılır?', a: 'Kahveniz seçtiğiniz periyotlarda taze kavrularak 1-3 iş günü içinde kargoya verilir.' },
            { q: 'Planları kim düzenliyor?', a: 'Planlar, fiyatlar ve özellikler admin panelden yönetilir, bu sayfada her zaman güncel bilgi görürsünüz.' },
          ].map((item, i) => (
            <details key={i} className="group rounded-2xl border border-neutral-200 dark:border-neutral-700">
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
          <Link href="/collections/all" className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-800">
            Kahveleri Keşfet
          </Link>
        </div>
      </div>
    </div>
  )
}
