'use client'

import { useCart } from '@/contexts/CartContext'
import { Coffee01Icon, DeliveryTruck01Icon, GiftIcon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface Plan {
  id: string
  name: string
  description?: string
  priceMonthly: number | string
  weightGrams?: number
  frequencyWeeks?: number
  discountPercent?: number
  features?: string[] | string
  isPopular?: boolean
  isActive?: boolean
}

function formatPrice(price: any): string {
  const num = typeof price === 'string' ? parseFloat(price) : Number(price || 0)
  return `₺${num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function weightLabel(grams?: number): string {
  if (!grams) return ''
  return grams >= 1000 ? `${grams / 1000}kg` : `${grams}g`
}

export default function SubscriptionPage() {
  const { addItem } = useCart()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [addedPlanId, setAddedPlanId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/subscription/plans`)
      .then((r) => r.json())
      .then((res) => {
        const data = res?.data?.data || res?.data || res || []
        const list = Array.isArray(data) ? data : []
        setPlans(list.filter((p: any) => p.isActive !== false))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSubscribe = (plan: Plan) => {
    addItem({
      productId: `sub-plan-${plan.id}`,
      name: `Abonelik — ${plan.name}`,
      handle: 'subscription',
      price: Number(plan.priceMonthly),
      quantity: 1,
      size: plan.weightGrams ? weightLabel(plan.weightGrams) : undefined,
    })
    setAddedPlanId(plan.id)
    toast.success('Abonelik sepete eklendi!', { duration: 2000 })
    setTimeout(() => setAddedPlanId(null), 3000)
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
            Size uygun bir plan seçin, biz taze kavurup gönderelim. İstediğiniz zaman iptal edin.
          </p>
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

      {/* Plans */}
      <div className="container mt-16">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Abonelik Planları</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-neutral-500">
          Admin panelden yönetilir — her zaman güncel fiyat ve içerik
        </p>

        {loading ? (
          <div className="mt-10 py-10 text-center text-neutral-400">Planlar yükleniyor...</div>
        ) : plans.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 p-10 text-center">
            <p className="text-neutral-500">Henüz aktif abonelik planı yok.</p>
            <p className="mt-1 text-xs text-neutral-400">Admin panelden plan ekleyin.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const features = Array.isArray(plan.features)
                ? plan.features
                : typeof plan.features === 'string'
                  ? plan.features.split('\n').filter(Boolean)
                  : []
              const isPopular = plan.isPopular
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl border-2 p-6 transition hover:-translate-y-1 hover:shadow-xl ${
                    isPopular
                      ? 'border-primary-600 bg-primary-50/30 dark:bg-primary-900/10'
                      : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white">
                      Popüler
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{plan.name}</h3>
                  {plan.description && (
                    <p className="mt-1 text-sm text-neutral-500">{plan.description}</p>
                  )}

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary-700">{formatPrice(plan.priceMonthly)}</span>
                    <span className="text-sm text-neutral-500">/ ay</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {plan.weightGrams && (
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium dark:bg-neutral-800">
                        {weightLabel(plan.weightGrams)}
                      </span>
                    )}
                    {plan.discountPercent ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        %{plan.discountPercent} indirim
                      </span>
                    ) : null}
                    {plan.frequencyWeeks && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        {plan.frequencyWeeks === 4 ? 'Ayda bir' : `${plan.frequencyWeeks} haftada bir`}
                      </span>
                    )}
                  </div>

                  {features.length > 0 && (
                    <ul className="mt-5 space-y-2.5 border-t pt-5 dark:border-neutral-700">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`mt-6 w-full rounded-full py-3 text-sm font-semibold transition ${
                      addedPlanId === plan.id
                        ? 'bg-green-600 text-white'
                        : isPopular
                          ? 'bg-primary-700 text-white hover:bg-primary-800'
                          : 'border border-neutral-300 text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-800'
                    }`}
                  >
                    {addedPlanId === plan.id ? '✓ Sepete Eklendi' : 'Abone Ol'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

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
