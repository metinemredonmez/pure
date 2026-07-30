'use client'

import { useCart } from '@/contexts/CartContext'
import { useTranslation } from '@/contexts/LanguageContext'
import { Coffee01Icon, DeliveryTruck01Icon, GiftIcon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type {
  SubscriptionConfig,
  SubscriptionPackageOption,
} from '@/lib/site-settings'

const STEP_ICON_MAP: Record<string, any> = {
  coffee: Coffee01Icon,
  package: PackageIcon,
  truck: DeliveryTruck01Icon,
  gift: GiftIcon,
}

type CoffeeKind = 'turk' | 'espresso' | 'filtre'

const COFFEE_LABELS: Record<CoffeeKind, string> = {
  turk: 'Türk Kahvesi',
  espresso: 'Espresso',
  filtre: 'Filtre Kahve',
}

function formatPrice(v: number) {
  return `₺${v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatGrams(g: number) {
  return g >= 1000 ? `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 1)} kg` : `${g} g`
}

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
  config: SubscriptionConfig
  durationDiscounts?: Record<number, number>
}

export default function SubscriptionPage({
  heroBadge = 'Kahve Aboneliği',
  heroTitle = 'Taze Kavrulmuş Kahve <br /> ile Kapınıza Geliyoruz',
  heroSubtitle = 'Kahve türünüzü seçin, paket içeriğini belirleyin — kahveniz her ay kapınızda.',
  heroCta = 'Hemen Başla',
  heroImage = '',
  steps = [],
  faqHeading = 'Sıkça Sorulan Sorular',
  faq = [],
  faqCta = 'Kahveleri Keşfet',
  config,
  durationDiscounts = { 3: 0, 6: 5, 12: 10 },
}: SubscriptionPageProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  // ───── 1. Kahve Türü ─────
  const [coffee, setCoffee] = useState<CoffeeKind | null>(null)
  // ───── 2. (Espresso/Filtre) Ürün Serisi ─────
  const [seriesId, setSeriesId] = useState<string | null>(null)
  // ───── 3. (Espresso/Filtre) Öğütüm ─────
  const [grindId, setGrindId] = useState<string | null>(null)
  // ───── 4. Paket ─────
  const [packageId, setPackageId] = useState<string | null>(null)
  // ───── 5. Süre ─────
  const [duration, setDuration] = useState<number>(3)

  // Kahve değişince diğer seçimler sıfırla
  useEffect(() => {
    if (!coffee) return
    setSeriesId(null)
    setGrindId(null)
    setPackageId(null)
    setDuration(3)
    if (coffee === 'turk' && config.turk?.packages?.length) {
      // Türk: ne seri ne öğütüm, paket sıralı seçim için boş bırakılır
    } else if ((coffee === 'espresso' || coffee === 'filtre')) {
      const cfg = coffee === 'espresso' ? config.espresso : config.filtre
      if (cfg?.series?.length) setSeriesId(cfg.series[0].id)
      if (cfg?.grinds?.length) setGrindId(cfg.grinds[0].id)
    }
  }, [coffee, config])

  // Mevcut paket listesi
  const packages: SubscriptionPackageOption[] = useMemo(() => {
    if (!coffee) return []
    if (coffee === 'turk') return config.turk?.packages || []
    if (coffee === 'espresso') return config.espresso?.packages || []
    if (coffee === 'filtre') return config.filtre?.packages || []
    return []
  }, [coffee, config])

  // 1 gönderim fiyatı (admin'den)
  const perShipmentPrice = useMemo(() => {
    if (!coffee || !packageId) return 0
    if (coffee === 'turk') {
      return Number(config.turk?.prices?.[packageId]) || 0
    }
    if (!seriesId) return 0
    if (coffee === 'espresso') {
      return Number(config.espresso?.prices?.[seriesId]?.[packageId]) || 0
    }
    if (coffee === 'filtre') {
      return Number(config.filtre?.prices?.[seriesId]?.[packageId]) || 0
    }
    return 0
  }, [coffee, packageId, seriesId, config])

  const selectedPackage = useMemo(() => packages.find((p) => p.id === packageId) || null, [packages, packageId])
  const selectedSeries = useMemo(() => {
    if (coffee === 'espresso') return config.espresso?.series.find((s) => s.id === seriesId) || null
    if (coffee === 'filtre') return config.filtre?.series.find((s) => s.id === seriesId) || null
    return null
  }, [coffee, seriesId, config])
  const selectedGrind = useMemo(() => {
    if (coffee === 'espresso') return config.espresso?.grinds.find((g) => g.id === grindId) || null
    if (coffee === 'filtre') return config.filtre?.grinds.find((g) => g.id === grindId) || null
    return null
  }, [coffee, grindId, config])

  // Hesaplamalar
  const totalShipments = duration
  const subtotal = perShipmentPrice * totalShipments
  const discountPercent = durationDiscounts[duration] ?? 0
  const discountAmount = (subtotal * discountPercent) / 100
  const totalPrice = subtotal - discountAmount
  const perShipmentGrams = selectedPackage ? selectedPackage.count * selectedPackage.grams : 0
  const totalGrams = perShipmentGrams * totalShipments

  const packageName = selectedPackage?.packageName || ''

  const canSubmit = !!coffee && !!packageId && perShipmentPrice > 0 && (coffee === 'turk' || (!!seriesId && !!grindId))

  const handleAddToCart = async () => {
    if (!canSubmit || !selectedPackage) {
      toast.error(t('subscription.complete_selections', 'Lütfen tüm seçimleri tamamlayın'))
      return
    }
    setAdding(true)
    try {
      const productName = `${packageName} — ${COFFEE_LABELS[coffee!]}${selectedSeries ? ' / ' + selectedSeries.label : ''} — ${selectedPackage.label}`
      const meta = {
        type: 'subscription' as const,
        coffee: coffee!,
        coffeeLabel: COFFEE_LABELS[coffee!],
        series: selectedSeries?.label || null,
        grind: selectedGrind?.label || null,
        packageId: selectedPackage.id,
        packageLabel: selectedPackage.label,
        packageName: selectedPackage.packageName,
        count: selectedPackage.count,
        grams: selectedPackage.grams,
        duration,
        totalShipments,
        perShipmentPrice,
        discountPercent,
        totalPrice,
      }
      await addItem({
        id: `sub-${coffee}-${seriesId || 'none'}-${grindId || 'none'}-${packageId}-${duration}`,
        name: productName,
        price: totalPrice,
        quantity: 1,
        image: '',
        slug: 'subscription',
        meta,
      } as any)
      toast.success(t('subscription.added_to_cart', 'Abonelik sepete eklendi'))
      router.push('/cart')
    } catch (e) {
      toast.error(t('subscription.add_failed', 'Sepete eklenemedi'))
    } finally {
      setAdding(false)
    }
  }

  const heroBg = heroImage || '/hero/subscription-bg.jpg'

  return (
    <div className="pb-24 lg:pb-32">
      {/* HERO */}
      <div
        className="relative overflow-hidden pb-20"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/40" aria-hidden />
        <div className="container relative z-10 py-20 text-center text-white lg:py-28">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
            {heroBadge}
          </span>
          <h1
            className="mx-auto mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
            dangerouslySetInnerHTML={{ __html: heroTitle }}
          />
          <p className="mx-auto mt-5 max-w-xl text-white/70 text-sm sm:text-base">{heroSubtitle}</p>
          <button
            type="button"
            onClick={() => document.getElementById('abonelik-secimi')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-neutral-900 shadow-lg transition hover:bg-neutral-100"
          >
            {heroCta}
          </button>
        </div>
      </div>

      {/* Steps */}
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

      {/* SEÇİM AKIŞI */}
      <div id="abonelik-secimi" className="container mt-20 scroll-mt-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">{t('subscription.create_title', 'Aboneliğinizi Oluşturun')}</h2>
          <p className="mt-3 text-center text-sm text-neutral-500">
            {t('subscription.create_subtitle', 'Önce kahve türünü seçin — sonraki adımlar kahve türüne göre değişir.')}
          </p>

          {/* 1. Kahve Türü */}
          <div className="mt-10">
            <Label step="1" text={t('subscription.coffee_type', 'Kahve Türü')} />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['turk', 'espresso', 'filtre'] as CoffeeKind[]).map((k) => {
                const enabled =
                  k === 'turk' ? config.turk?.enabled !== false :
                  k === 'espresso' ? config.espresso?.enabled !== false :
                  config.filtre?.enabled !== false
                if (!enabled) return null
                const active = coffee === k
                return (
                  <button
                    key={k}
                    onClick={() => setCoffee(k)}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      active
                        ? 'border-primary-700 bg-primary-700 text-white'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-700 hover:text-primary-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {COFFEE_LABELS[k]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Espresso/Filtre — Ürün Serisi */}
          {coffee && coffee !== 'turk' && (
            <div className="mt-8">
              <Label step="2" text={t('subscription.product_series', 'Ürün Serisi')} />
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(coffee === 'espresso' ? config.espresso.series : config.filtre.series).map((s) => {
                  const active = seriesId === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSeriesId(s.id)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-700 hover:text-primary-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3. Espresso: Öğütüm (paket öncesi). Filtre: Paket (öğütüm sonra) */}
          {coffee === 'espresso' && seriesId && (
            <div className="mt-8">
              <Label step="3" text={t('subscription.grind_type', 'Öğütüm Şekli')} />
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {config.espresso.grinds.map((g) => {
                  const active = grindId === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGrindId(g.id)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-700 hover:text-primary-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 4. Paket Seçimi */}
          {((coffee === 'turk') ||
            (coffee === 'espresso' && seriesId && grindId) ||
            (coffee === 'filtre' && seriesId)) && (
            <div className="mt-8">
              <Label step={coffee === 'turk' ? '2' : coffee === 'espresso' ? '4' : '3'} text={t('subscription.package_selection', 'Paket Seçimi')} />
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {packages.map((p) => {
                  const active = packageId === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPackageId(p.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? 'border-primary-700 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-neutral-300 bg-white hover:border-primary-700 dark:border-neutral-600 dark:bg-neutral-800'
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-primary-700">
                        {p.packageName}
                      </p>
                      <p className="mt-2 text-base font-semibold text-neutral-900 dark:text-white">
                        {p.label}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {t('subscription.per_shipment_detail', 'Her gönderimde {count} × {grams} = {total}', { count: p.count, grams: formatGrams(p.grams), total: formatGrams(p.count * p.grams) })}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Filtre Kahve: Öğütüm (paketin SONRASI) */}
          {coffee === 'filtre' && seriesId && packageId && (
            <div className="mt-8">
              <Label step="4" text={t('subscription.grind_type', 'Öğütüm Şekli')} />
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {config.filtre.grinds.map((g) => {
                  const active = grindId === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGrindId(g.id)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-700 hover:text-primary-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 5. Abonelik Süresi */}
          {packageId && (coffee === 'turk' || (seriesId && grindId)) && (
            <div className="mt-8">
              <Label step={coffee === 'turk' ? '3' : '5'} text={t('subscription.duration', 'Abonelik Süresi')} />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[3, 6, 12].map((d) => {
                  const active = duration === d
                  const discount = durationDiscounts[d] ?? 0
                  return (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        active
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-700 hover:text-primary-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div>{t('subscription.months', '{count} Ay', { count: d })}</div>
                      {discount > 0 && (
                        <div className={`mt-1 text-[10px] ${active ? 'text-white/80' : 'text-emerald-600'}`}>
                          {t('subscription.percent_discount', '%{percent} indirim', { percent: discount })}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* AÇIKLAMA */}
          <p className="mt-8 rounded-xl bg-neutral-50 px-4 py-3 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
            {t('subscription.package_note_1', 'Seçtiğiniz paket içeriği,')} <strong>{t('subscription.each_shipment', 'her gönderimde')}</strong> {t('subscription.package_note_2', 'adresinize teslim edilecek kahve miktarını ifade eder. Abonelik süreniz boyunca kahveniz ayda 1 kez düzenli olarak gönderilir.')}
          </p>

          {/* SİPARİŞ ÖZETİ */}
          {selectedPackage && (coffee === 'turk' || (seriesId && grindId)) && (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/20">
              <div className="border-b border-amber-200/60 px-4 py-2.5 dark:border-amber-700/30">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
                  📦 {t('subscription.order_summary', 'Sipariş Özeti')}
                </p>
              </div>
              <div className="px-4 py-4 text-sm">
                <Row label={t('subscription.selected_package', 'Seçilen Paket')} value={packageName} />
                <Row label={t('subscription.coffee_type', 'Kahve Türü')} value={COFFEE_LABELS[coffee!]} />
                {selectedSeries && <Row label={t('subscription.product_series', 'Ürün Serisi')} value={selectedSeries.label} />}
                {selectedGrind && <Row label={t('subscription.grind_type', 'Öğütüm Şekli')} value={selectedGrind.label} />}
                <Row label={t('subscription.each_shipment_label', 'Her Gönderimde')} value={t('subscription.count_grams', '{count} adet {grams}', { count: selectedPackage.count, grams: formatGrams(selectedPackage.grams) })} />
                <Row label={t('subscription.each_shipment_total', 'Her Gönderimde Toplam')} value={formatGrams(perShipmentGrams)} />
                <Row label={t('subscription.duration', 'Abonelik Süresi')} value={t('subscription.months', '{count} Ay', { count: duration })} />
                <Row label={t('subscription.total_shipments', 'Toplam Gönderim')} value={t('subscription.count_pieces', '{count} adet', { count: totalShipments })} />
                <Row label={t('subscription.total_coffee_amount', 'Toplam Kahve Miktarı')} value={formatGrams(totalGrams)} />
                <Row label={t('subscription.per_shipment_price', 'Gönderim Başı Fiyat')} value={perShipmentPrice > 0 ? formatPrice(perShipmentPrice) : '—'} />
                {discountPercent > 0 && <Row label={t('subscription.subscription_discount', 'Abonelik İndirimi')} value={`%${discountPercent}`} />}
                <div className="mt-3 flex items-center justify-between border-t border-amber-200/60 pt-3 dark:border-amber-700/30">
                  <span className="text-sm font-bold uppercase tracking-widest text-amber-900 dark:text-amber-200">
                    {t('subscription.total_amount', 'Toplam Abonelik Tutarı')}
                  </span>
                  <span className="text-xl font-bold text-amber-900 dark:text-amber-200">
                    {perShipmentPrice > 0 ? formatPrice(totalPrice) : t('subscription.price_unavailable', 'Fiyat alınamadı')}
                  </span>
                </div>
                {perShipmentPrice <= 0 && (
                  <p className="mt-3 rounded-md bg-amber-100 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    ⚠️ {t('subscription.price_not_defined', 'Bu kombinasyon için fiyat tanımlı değil. Admin Panel → Abonelikler → Abonelik Planları → Fiyat Matrisi bölümünden fiyatı girilebilir.')}
                  </p>
                )}
              </div>
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canSubmit || adding}
                  className={`w-full rounded-xl py-3 text-sm font-bold transition ${
                    canSubmit && !adding
                      ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {adding ? t('subscription.adding', 'Sepete ekleniyor...') : canSubmit ? t('subscription.subscribe_add', 'Abone Ol & Sepete Ekle') : t('subscription.incomplete', 'Eksik Seçim')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SSS */}
      {faq.length > 0 && (
        <div className="container mt-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
              {faqHeading}
            </h2>
            <div className="mt-8 divide-y divide-neutral-200 dark:divide-neutral-700">
              {faq.map((f) => (
                <details key={f.id} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-neutral-900 dark:text-white">
                    {f.q}
                    <span className="ml-4 text-xl transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{f.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="/collections/all"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-primary-700 hover:text-primary-700 dark:border-neutral-600 dark:text-neutral-200"
              >
                {faqCta}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Label({ step, text }: { step: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-700 text-xs font-bold text-white">
        {step}
      </span>
      <label className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-white">{text}</label>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-neutral-600 dark:text-neutral-300">{label}</span>
      <span className="font-semibold text-neutral-900 dark:text-white">{value}</span>
    </div>
  )
}
