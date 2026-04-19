'use client'

import { useCart } from '@/contexts/CartContext'
import { Coffee01Icon, DeliveryTruck01Icon, GiftIcon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
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
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'turk-kahvesi',
    slugs: ['turk-kahvesi', 'turk', 'turkish'],
    title: 'Abonelik No.01',
    name: 'Türk Kahvesi',
    fallbackImage: '/hero/turk-kahvesi-100gr.jpg',
    grind: 'Türk',
  },
  {
    id: 'espresso',
    slugs: ['espresso'],
    title: 'Abonelik No.02',
    name: 'Espresso',
    fallbackImage: '/hero/brazil-santos.jpg',
    grind: 'Espresso',
  },
  {
    id: 'filtre-kahve',
    slugs: ['filtre-kahve', 'filtre', 'filter'],
    title: 'Abonelik No.03',
    name: 'Filtre Kahve',
    fallbackImage: '/hero/hediye-paketi.jpg',
    grind: 'Filtre',
  },
]

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

const GRAMS = [
  { id: '1x250', label: '1 x 250 g', bags: 1, grams: 250 },
  { id: '2x250', label: '2 x 250 g', bags: 2, grams: 500 },
  { id: '3x250', label: '3 x 250 g', bags: 3, grams: 750 },
  { id: '1x1000', label: '1 x 1 kg', bags: 1, grams: 1000 },
]

const GRINDS_BY_CAT: Record<string, string[]> = {
  'turk-kahvesi': ['Türk'],
  espresso: ['Espresso', 'Moka Pot'],
  'filtre-kahve': ['Filtre', 'French Press', 'Chemex', 'AeroPress'],
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
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

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
  }, [])

  const scrollToPlans = () => {
    document.getElementById('abonelik-planlari')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cat = CATEGORIES.find((c) => c.id === selectedCategory) || null

  // Products of selected category
  const categoryProducts = useMemo(() => {
    if (!cat) return []
    return products.filter((p) => {
      const slug = p.category?.slug?.toLowerCase() || ''
      return cat.slugs.includes(slug)
    })
  }, [cat, products])

  // Base monthly price: prefer matching plan, else derive from products
  const basePricePerBag = useMemo(() => {
    if (!cat) return 0
    // Try matching plan by name
    const match = plans.find((p) => p.name.toLowerCase().includes(cat.name.toLowerCase()))
    if (match) return Number(match.priceMonthly) || 0
    if (categoryProducts.length > 0) {
      const prices = categoryProducts.map((p) => Number(p.price)).filter((n) => n > 0)
      if (prices.length) return Math.min(...prices)
    }
    return plans.length ? Number(plans[0].priceMonthly) : 250
  }, [cat, plans, categoryProducts])

  // Periods per month
  const periodsPerMonth = useMemo(() => (period === 4 ? 1 : period === 2 ? 2 : 4), [period])

  const gramsInfo = GRAMS.find((g) => g.id === gramsOpt) || GRAMS[0]

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
    const c = CATEGORIES.find((x) => x.id === id)
    if (!c) return
    setSelectedCategory(id)
    setGrind(GRINDS_BY_CAT[id]?.[0] || c.grind)
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

    const durLabel = DURATIONS.find((d) => d.months === duration)?.label
    const perLabel = PERIODS.find((p) => p.weeks === period)?.label

    setAdding(true)
    const shortCoffees = selectedCoffees.length > 0 ? ` [${chosenNames.length > 60 ? chosenNames.slice(0, 57) + '...' : chosenNames}]` : ''
    addItem({
      productId: `sub-${cat.id}-${duration}m-${period}w-${gramsOpt}-${grind}`,
      name: `Abonelik — ${cat.name} (${durLabel}, ${perLabel}, ${gramsInfo.label}, ${grind})${shortCoffees}`,
      handle: 'subscription',
      price: totalPrice,
      quantity: 1,
      size: gramsInfo.label,
    })

    toast.success('Abonelik sepete eklendi!', { duration: 2500 })
    setTimeout(() => {
      setAdding(false)
      setSelectedCategory(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
            className="mt-10 inline-flex items-center justify-center rounded-none bg-white px-12 py-4 text-sm font-semibold uppercase tracking-widest text-neutral-900 transition hover:bg-neutral-100"
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

      {/* 3 Category Cards */}
      <div id="abonelik-planlari" className="container mt-20 scroll-mt-10">
        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((c) => {
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
              {DURATIONS.find((d) => d.months === duration)?.label} · sevkiyat başı {formatPrice(pricePerShipment)}
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
                  {DURATIONS.map((d) => (
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
                  {PERIODS.map((p) => (
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
                  {GRAMS.map((g) => (
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
                  {(GRINDS_BY_CAT[cat.id] || ['Filtre']).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={addToCart}
              disabled={adding}
              className={`mt-10 w-full py-4 text-sm font-semibold uppercase tracking-widest text-white transition ${
                adding ? 'bg-green-600' : 'bg-neutral-900 hover:bg-primary-700 dark:bg-white dark:text-neutral-900'
              }`}
            >
              {adding ? '✓ Sepete Eklendi' : 'Sepete Ekle'}
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
