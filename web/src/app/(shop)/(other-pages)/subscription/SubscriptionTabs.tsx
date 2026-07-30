'use client'

import { useCart } from '@/contexts/CartContext'
import { useTranslation } from '@/contexts/LanguageContext'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { CheckIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface Plan {
  period: string
  months: number
  discount: number
  popular?: boolean
  features: string[]
  basePrice: number
}

const GRAMAJ_OPTIONS = [
  { label: '250g', value: 250, multiplier: 1 },
  { label: '500g', value: 500, multiplier: 1.8 },
  { label: '1kg', value: 1000, multiplier: 3.2 },
]

const KAHVE_TIPI = ['Espresso', 'Filtre Kahve', 'Türk Kahvesi']

function formatPrice(price: number): string {
  return `₺${Math.round(price).toLocaleString('tr-TR')}`
}

export default function SubscriptionTabs({
  bireyselPlans,
  kurumsalPlans,
}: {
  bireyselPlans: Plan[]
  kurumsalPlans: Plan[]
}) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'bireysel' | 'kurumsal'>('bireysel')
  const [gramaj, setGramaj] = useState(250)
  const [kahveTipi, setKahveTipi] = useState('Filtre Kahve')
  const [addedPlan, setAddedPlan] = useState<string | null>(null)
  const { addItem } = useCart()

  const plans = tab === 'bireysel' ? bireyselPlans : kurumsalPlans
  const gramajOption = GRAMAJ_OPTIONS.find((g) => g.value === gramaj) || GRAMAJ_OPTIONS[0]

  return (
    <div>
      {/* Tab buttons */}
      <div className="mx-auto mb-10 flex max-w-md overflow-hidden rounded-full border border-neutral-200 p-1 dark:border-neutral-700">
        <button
          type="button"
          onClick={() => setTab('bireysel')}
          className={`flex-1 rounded-full px-6 py-3 text-sm font-medium transition ${
            tab === 'bireysel'
              ? 'bg-primary-700 text-white shadow'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          {t('subscription.individual', 'Bireysel Abonelik')}
        </button>
        <button
          type="button"
          onClick={() => setTab('kurumsal')}
          className={`flex-1 rounded-full px-6 py-3 text-sm font-medium transition ${
            tab === 'kurumsal'
              ? 'bg-primary-700 text-white shadow'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          {t('subscription.corporate', 'Kurumsal Abonelik')}
        </button>
      </div>

      {/* Gramaj + Kahve tipi seçimi */}
      {tab === 'bireysel' && (
        <div className="mx-auto mb-12 flex max-w-2xl flex-wrap items-center justify-center gap-6">
          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              {t('subscription.gramaj', 'Gramaj')}
            </label>
            <div className="flex gap-2">
              {GRAMAJ_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGramaj(g.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    gramaj === g.value
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              {t('subscription.coffee_kind', 'Kahve Tipi')}
            </label>
            <div className="flex gap-2">
              {KAHVE_TIPI.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setKahveTipi(t)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    kahveTipi === t
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <section className="overflow-hidden text-sm text-neutral-600 md:text-base">
        <div className="grid gap-5 lg:grid-cols-3 xl:gap-8">
          {plans.map((plan, index) => {
            const monthlyPrice = tab === 'bireysel'
              ? plan.basePrice * gramajOption.multiplier * (1 - plan.discount / 100)
              : plan.basePrice * (1 - plan.discount / 100)
            const totalPrice = monthlyPrice * plan.months

            return (
              <div
                key={plan.period}
                className={`relative flex h-full flex-col overflow-hidden rounded-3xl border-2 px-6 py-8 ${
                  plan.popular ? 'border-primary-500' : 'border-neutral-100 dark:border-neutral-700'
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-3 right-3 z-10 rounded-full bg-primary-500 px-3 py-1 text-xs tracking-widest text-white">
                    {t('subscription.popular', 'POPÜLER')}
                  </span>
                )}
                <div className="mb-8">
                  <h3 className="mb-2 block text-sm font-medium tracking-widest text-neutral-600 uppercase dark:text-neutral-300">
                    {plan.period}
                  </h3>
                  <h2 className="flex items-baseline gap-1 text-4xl leading-none text-neutral-800 dark:text-neutral-200">
                    <span className="font-bold">{formatPrice(monthlyPrice)}</span>
                    <span className="text-lg font-normal text-neutral-500">{t('subscription.per_month', '/ay')}</span>
                  </h2>
                  <p className="mt-2 text-xs text-neutral-500">
                    {t('subscription.total_with_discount', 'Toplam {price} · %{discount} indirim', { price: formatPrice(totalPrice), discount: plan.discount })}
                  </p>
                  {tab === 'bireysel' && (
                    <p className="mt-1 text-xs text-primary-600 font-medium">
                      {gramajOption.label} {kahveTipi}
                    </p>
                  )}
                </div>
                <nav className="mb-8 space-y-4">
                  {plan.features.map((item, idx) => (
                    <li className="flex items-center" key={idx}>
                      <span className="mr-4 inline-flex shrink-0 text-primary-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">{item}</span>
                    </li>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col">
                  {plan.popular ? (
                    <ButtonPrimary
                      onClick={() => {
                        const label = tab === 'bireysel'
                          ? `Abonelik ${plan.period} — ${gramajOption.label} ${kahveTipi}`
                          : `Kurumsal Abonelik ${plan.period}`
                        addItem({
                          productId: `sub-${tab}-${plan.months}-${gramaj}-${kahveTipi}`,
                          name: label,
                          handle: 'subscription',
                          price: Math.round(totalPrice),
                          quantity: 1,
                          size: tab === 'bireysel' ? `${gramajOption.label} / ${kahveTipi}` : undefined,
                        })
                        setAddedPlan(plan.period)
                        setTimeout(() => setAddedPlan(null), 2000)
                      }}
                    >
                      {addedPlan === plan.period ? t('cart.added', 'Sepete Eklendi!') : t('common.add_to_cart', 'Sepete Ekle')}
                    </ButtonPrimary>
                  ) : (
                    <ButtonSecondary
                      onClick={() => {
                        const label = tab === 'bireysel'
                          ? `Abonelik ${plan.period} — ${gramajOption.label} ${kahveTipi}`
                          : `Kurumsal Abonelik ${plan.period}`
                        addItem({
                          productId: `sub-${tab}-${plan.months}-${gramaj}-${kahveTipi}`,
                          name: label,
                          handle: 'subscription',
                          price: Math.round(totalPrice),
                          quantity: 1,
                          size: tab === 'bireysel' ? `${gramajOption.label} / ${kahveTipi}` : undefined,
                        })
                        setAddedPlan(plan.period)
                        setTimeout(() => setAddedPlan(null), 2000)
                      }}
                    >
                      <span className="font-medium">{addedPlan === plan.period ? t('cart.added', 'Sepete Eklendi!') : t('common.add_to_cart', 'Sepete Ekle')}</span>
                    </ButtonSecondary>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Info note */}
      <div className="mx-auto mt-12 max-w-2xl text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t('subscription.info_note', 'İstediğiniz zaman hesap panelinizden iptal edebilirsiniz. İndirim oranları admin panelden yönetilir. Kurumsal abonelikler için')} <a href="/b2b" className="text-primary-600 underline">{t('subscription.get_quote', 'teklif alın')}</a>.
        </p>
      </div>
    </div>
  )
}
