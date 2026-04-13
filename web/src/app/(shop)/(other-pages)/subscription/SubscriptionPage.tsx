'use client'

import { useCart } from '@/contexts/CartContext'
import { Coffee01Icon, DeliveryTruck01Icon, GiftIcon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

// ── Data ──

const CATEGORIES = [
  { id: 'turk', name: 'Türk Kahvesi', desc: 'Geleneksel ince öğütülmüş', image: '/hero/turk-kahvesi-100gr.jpg' },
  { id: 'filtre', name: 'Filtre Kahve', desc: 'Pour-over & French Press', image: '/hero/brazil-santos.jpg' },
  { id: 'espresso', name: 'Espresso', desc: 'Espresso makineleri için', image: '/hero/hediye-paketi.jpg' },
]

const DURATIONS = [
  { months: 3, label: '3 Ay', discount: 0 },
  { months: 6, label: '6 Ay', discount: 10, popular: true },
  { months: 12, label: '12 Ay', discount: 20 },
]

const PERIODS = [
  { weeks: 2, label: '2 Haftada bir' },
  { weeks: 4, label: 'Ayda bir' },
]

const GRAMAJ_OPTIONS = [
  { label: '1 x 250g', grams: 250, multiplier: 1 },
  { label: '2 x 250g', grams: 500, multiplier: 1.8 },
  { label: '1 x 1kg', grams: 1000, multiplier: 3.2 },
]

const GRIND_OPTIONS: Record<string, string[]> = {
  turk: ['Türk Kahvesi Öğütme'],
  filtre: ['Çekirdek', 'Filtre Öğütme', 'French Press Öğütme'],
  espresso: ['Çekirdek', 'Espresso Öğütme'],
}

const COFFEES: Record<string, string[]> = {
  turk: ['Klasik Türk Kahvesi', 'Menengiç Kahvesi', 'Damla Sakızlı', 'Sürpriz Seçim'],
  filtre: ['Ethiopia Yirgacheffe', 'Colombia Supremo', 'Brazil Santos', 'Kenya AA', 'Sürpriz Seçim'],
  espresso: ['Espresso Blend', 'Single Origin Espresso', 'Dark Roast Espresso', 'Sürpriz Seçim'],
}

const BASE_PRICE = 189 // aylık baz fiyat (250g)

// ── Component ──

export default function SubscriptionPage() {
  const { addItem } = useCart()

  const [category, setCategory] = useState('filtre')
  const [duration, setDuration] = useState(6)
  const [period, setPeriod] = useState(4)
  const [gramaj, setGramaj] = useState(250)
  const [grind, setGrind] = useState('')
  const [coffee, setCoffee] = useState('')
  const [added, setAdded] = useState(false)

  // Derived
  const durationObj = DURATIONS.find(d => d.months === duration) || DURATIONS[1]
  const gramajObj = GRAMAJ_OPTIONS.find(g => g.grams === gramaj) || GRAMAJ_OPTIONS[0]
  const deliveryCount = Math.ceil(duration / (period / 4))
  const monthlyPrice = Math.round(BASE_PRICE * gramajObj.multiplier * (1 - durationObj.discount / 100))
  const totalPrice = monthlyPrice * deliveryCount
  const savingsPercent = durationObj.discount

  // Reset grind/coffee when category changes
  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    setGrind(GRIND_OPTIONS[cat]?.[0] || '')
    setCoffee(COFFEES[cat]?.[0] || '')
  }

  // Initialize grind/coffee on first render
  if (!grind) setGrind(GRIND_OPTIONS[category]?.[0] || '')
  if (!coffee) setCoffee(COFFEES[category]?.[0] || '')

  const handleAddToCart = () => {
    const categoryName = CATEGORIES.find(c => c.id === category)?.name || category
    const label = `Abonelik ${durationObj.label} — ${categoryName} ${gramajObj.label}`

    addItem({
      productId: `sub-${category}-${duration}-${period}-${gramaj}`,
      name: label,
      handle: 'subscription',
      price: totalPrice,
      quantity: 1,
      size: `${gramajObj.label} / ${grind} / ${coffee}`,
      image: CATEGORIES.find(c => c.id === category)?.image,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  return (
    <div className="overflow-x-hidden pb-24 lg:pb-32">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-800 via-amber-900 to-primary-950">
        <div className="container py-16 text-center text-white lg:py-24">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
            Kahve Aboneliği
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-bold sm:text-4xl lg:text-5xl">
            Taze Kavrulmuş Kahve <br /> Her Ay Kapınızda
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Demleme tarzınıza göre seçin, biz taze kavurup gönderelim. İstediğiniz zaman iptal edin.
          </p>
        </div>
      </div>

      {/* How it works — 4 steps */}
      <div className="container -mt-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            { icon: Coffee01Icon, title: 'Tarzınızı Seçin', desc: 'Türk, Filtre veya Espresso' },
            { icon: PackageIcon, title: 'Konfigüre Edin', desc: 'Süre, gramaj ve öğütme' },
            { icon: DeliveryTruck01Icon, title: 'Biz Gönderelim', desc: 'Taze kavrulmuş, kapınızda' },
            { icon: GiftIcon, title: 'Keyfini Çıkarın', desc: 'Her seferinde yeni lezzet' },
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

      {/* Configurator */}
      <div className="container mt-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Aboneliğinizi Oluşturun</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-neutral-500">
            Demleme tarzınızı seçin ve tercihlerinizi belirleyin
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* Left — Options */}
            <div className="space-y-8">

              {/* 1. Kategori */}
              <div>
                <label className="mb-3 block text-sm font-semibold tracking-wider text-neutral-500 uppercase">1. Kahve Türü</label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`group relative overflow-hidden rounded-2xl border-2 p-3 text-left transition ${
                        category === cat.id
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-700'
                      }`}
                    >
                      <div className="relative mx-auto mb-2 h-16 w-16 overflow-hidden rounded-xl bg-neutral-100 sm:h-20 sm:w-20">
                        <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="80px" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-neutral-900 dark:text-white">{cat.name}</div>
                        <div className="text-xs text-neutral-500">{cat.desc}</div>
                      </div>
                      {category === cat.id && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Süre */}
              <div>
                <label className="mb-3 block text-sm font-semibold tracking-wider text-neutral-500 uppercase">2. Abonelik Süresi</label>
                <div className="flex gap-3">
                  {DURATIONS.map(d => (
                    <button
                      key={d.months}
                      onClick={() => setDuration(d.months)}
                      className={`relative flex-1 rounded-xl border-2 px-4 py-3 text-center transition ${
                        duration === d.months
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-700'
                      }`}
                    >
                      <div className="text-lg font-bold text-neutral-900 dark:text-white">{d.label}</div>
                      {d.discount > 0 && (
                        <div className="mt-0.5 text-xs font-medium text-green-600">%{d.discount} indirim</div>
                      )}
                      {d.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          Popüler
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Teslimat Periyodu */}
              <div>
                <label className="mb-3 block text-sm font-semibold tracking-wider text-neutral-500 uppercase">3. Teslimat Sıklığı</label>
                <div className="flex gap-3">
                  {PERIODS.map(p => (
                    <button
                      key={p.weeks}
                      onClick={() => setPeriod(p.weeks)}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition ${
                        period === p.weeks
                          ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Gramaj */}
              <div>
                <label className="mb-3 block text-sm font-semibold tracking-wider text-neutral-500 uppercase">4. Gramaj</label>
                <div className="flex gap-3">
                  {GRAMAJ_OPTIONS.map(g => (
                    <button
                      key={g.grams}
                      onClick={() => setGramaj(g.grams)}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-center transition ${
                        gramaj === g.grams
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-700'
                      }`}
                    >
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white">{g.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Kahve Seçimi */}
              <div>
                <label className="mb-3 block text-sm font-semibold tracking-wider text-neutral-500 uppercase">5. Kahve Seçimi</label>
                <select
                  value={coffee}
                  onChange={e => setCoffee(e.target.value)}
                  className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 focus:border-primary-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  {COFFEES[category]?.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 6. Öğütme */}
              <div>
                <label className="mb-3 block text-sm font-semibold tracking-wider text-neutral-500 uppercase">6. Öğütme Derecesi</label>
                <div className="flex flex-wrap gap-2">
                  {GRIND_OPTIONS[category]?.map(g => (
                    <button
                      key={g}
                      onClick={() => setGrind(g)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        grind === g
                          ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Pricing Summary (sticky) */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Abonelik Özeti</h3>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Kahve Türü</span>
                    <span className="font-medium">{CATEGORIES.find(c => c.id === category)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Kahve</span>
                    <span className="font-medium">{coffee || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Süre</span>
                    <span className="font-medium">{durationObj.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Teslimat</span>
                    <span className="font-medium">{PERIODS.find(p => p.weeks === period)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Gramaj</span>
                    <span className="font-medium">{gramajObj.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Öğütme</span>
                    <span className="font-medium">{grind || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Teslimat Sayısı</span>
                    <span className="font-medium">{deliveryCount} kez</span>
                  </div>
                </div>

                <div className="mt-5 border-t pt-5 dark:border-neutral-700">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-neutral-500">Aylık</span>
                    <div>
                      <span className="text-2xl font-bold text-neutral-900 dark:text-white">₺{monthlyPrice.toLocaleString('tr-TR')}</span>
                      <span className="text-sm text-neutral-500">/teslimat</span>
                    </div>
                  </div>
                  {savingsPercent > 0 && (
                    <div className="mt-1 text-right text-xs font-medium text-green-600">%{savingsPercent} indirimli</div>
                  )}
                  <div className="mt-3 flex justify-between border-t pt-3 text-sm dark:border-neutral-700">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">Toplam</span>
                    <span className="text-lg font-bold text-primary-700">₺{totalPrice.toLocaleString('tr-TR')}</span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`mt-5 w-full rounded-full py-3.5 text-sm font-semibold transition ${
                    added
                      ? 'bg-green-600 text-white'
                      : 'bg-primary-700 text-white hover:bg-primary-800'
                  }`}
                >
                  {added ? '✓ Sepete Eklendi!' : 'Sepete Ekle'}
                </button>

                <p className="mt-3 text-center text-xs text-neutral-400">
                  İstediğiniz zaman iptal edebilirsiniz
                </p>

                {/* Trust */}
                <div className="mt-5 flex items-center justify-center gap-3 border-t pt-4 dark:border-neutral-700">
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Ücretsiz kargo
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Taze kavurma
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    İptal garantisi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SSS */}
      <div className="container mt-24">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Sıkça Sorulan Sorular</h2>
        <div className="mx-auto mt-10 max-w-2xl space-y-4">
          {[
            { q: 'Aboneliğimi istediğim zaman iptal edebilir miyim?', a: 'Evet, aboneliğinizi dilediğiniz zaman hesabınızdan iptal edebilirsiniz. Kalan teslimatlara ait ücret iade edilir.' },
            { q: 'Kahve tercihimi değiştirebilir miyim?', a: 'Elbette! Her teslimat öncesi kahve türünüzü, gramajınızı ve öğütme derecenizi değiştirebilirsiniz.' },
            { q: 'Teslimat ne zaman yapılır?', a: 'Kahveniz sipariş tarihinden itibaren seçtiğiniz periyotlarda taze kavrularak 1-3 iş günü içinde kargoya verilir.' },
            { q: 'Sürpriz seçim ne demek?', a: 'Her teslimatınızda farklı bir single origin kahve göndeririz. Yeni tatlar keşfetmek isteyenler için ideal!' },
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
      </div>
    </div>
  )
}
