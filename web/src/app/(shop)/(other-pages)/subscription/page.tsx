import { apiGetSubscriptionPlans } from '@/lib/api'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { CheckIcon } from '@heroicons/react/24/solid'

export interface PricingItem {
  id?: string
  slug?: string
  isPopular: boolean
  name: string
  pricing: string
  desc: string
  per: string
  features: string[]
}

// Fallback plans used only when the backend has no active plans and the
// API call returns an empty list. Kept minimal — admin is the real source.
const FALLBACK_PLANS: PricingItem[] = [
  {
    isPopular: false,
    name: 'Keşif',
    pricing: '₺199',
    per: '/ay',
    features: ['Ayda 250g taze kahve', 'Farklı menşei her ay', 'Demleme rehberi', 'Ücretsiz kargo'],
    desc: 'Specialty kahve dünyasını keşfetmeye başlayın.',
  },
  {
    isPopular: true,
    name: 'Tutkulu',
    pricing: '₺349',
    per: '/ay',
    features: ['Ayda 500g taze kahve', 'İki farklı menşei', 'Demleme rehberi', 'Öncelikli teslimat', 'Özel indirimler'],
    desc: 'En popüler plan. Kahve tutkunları için ideal.',
  },
  {
    isPopular: false,
    name: 'Uzman',
    pricing: '₺549',
    per: '/ay',
    features: [
      'Ayda 1kg taze kahve',
      'Üç farklı menşei',
      'Özel kavurma tercihi',
      'Öncelikli teslimat',
      '%15 ekipman indirimi',
      'Q Grader notları',
    ],
    desc: 'Profesyoneller ve yoğun tüketiciler için.',
  },
]

export const metadata = {
  title: 'Abonelik',
  description: 'Pure Olentia kahve abonelik planları. Her ay kapınıza taze kavrulmuş specialty kahve.',
}

function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return '₺0'
  return `₺${num.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function buildFeatures(plan: any): string[] {
  const features: string[] = []
  if (plan.monthlyWeight) {
    const weight =
      plan.monthlyWeight >= 1000
        ? `${(plan.monthlyWeight / 1000).toLocaleString('tr-TR')} kg`
        : `${plan.monthlyWeight} gr`
    features.push(`Ayda ${weight} taze kahve`)
  }
  if (plan.discountPercent) features.push(`%${plan.discountPercent} abonelik indirimi`)
  if (plan.freeShipping) features.push('Ücretsiz kargo')
  features.push('İstediğiniz zaman iptal')
  features.push('Demleme rehberi dahil')
  return features
}

export default async function PageSubcription() {
  // Fetch plans from backend; fall back to static list only if empty
  let plans: PricingItem[] = []
  try {
    const res = (await apiGetSubscriptionPlans()) as any
    const planData = res?.data || res || []
    const list: any[] = Array.isArray(planData) ? planData : planData?.data || []
    if (list.length) {
      plans = list.map((plan, i) => ({
        id: plan.id,
        slug: plan.slug,
        isPopular: i === Math.floor(list.length / 2),
        name: plan.name,
        pricing: formatPrice(plan.priceMonthly),
        per: '/ay',
        features: buildFeatures(plan),
        desc: plan.description || 'Abone olun, kahvenizi her ay kapınıza taze kavrulmuş olarak alın.',
      }))
    }
  } catch {
    // fall through to fallback
  }

  if (!plans.length) plans = FALLBACK_PLANS

  const renderPricingItem = (pricing: PricingItem, index: number) => {
    return (
      <div
        key={pricing.id || index}
        className={`relative flex h-full flex-col overflow-hidden rounded-3xl border-2 px-6 py-8 ${
          pricing.isPopular ? 'border-primary-500' : 'border-neutral-100 dark:border-neutral-700'
        }`}
      >
        {pricing.isPopular && (
          <span className="absolute top-3 right-3 z-10 rounded-full bg-primary-500 px-3 py-1 text-xs tracking-widest text-white">
            POPÜLER
          </span>
        )}
        <div className="mb-8">
          <h3 className="mb-2 block text-sm font-medium tracking-widest text-neutral-600 uppercase dark:text-neutral-300">
            {pricing.name}
          </h3>
          <h2 className="flex items-center text-5xl leading-none text-neutral-800 dark:text-neutral-200">
            <span>{pricing.pricing}</span>
            <span className="ml-1 text-lg font-normal text-neutral-500">{pricing.per}</span>
          </h2>
        </div>
        <nav className="mb-8 space-y-4">
          {pricing.features.map((item, idx) => (
            <li className="flex items-center" key={idx}>
              <span className="mr-4 inline-flex shrink-0 text-primary-600">
                <CheckIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-neutral-700 dark:text-neutral-300">{item}</span>
            </li>
          ))}
        </nav>
        <div className="mt-auto flex flex-col">
          {pricing.isPopular ? (
            <ButtonPrimary href="/signup">Abone Ol</ButtonPrimary>
          ) : (
            <ButtonSecondary href="/signup">
              <span className="font-medium">Abone Ol</span>
            </ButtonSecondary>
          )}
          <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">{pricing.desc}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container pb-24 lg:pb-32">
      <header className="mx-auto my-20 max-w-2xl text-center">
        <h2 className="flex items-center justify-center text-3xl leading-[115%] font-semibold text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
          Kahve Aboneliği
        </h2>
        <span className="mt-2 block text-sm text-neutral-700 sm:text-base dark:text-neutral-200">
          Her ay kapınıza taze kavrulmuş specialty kahve. İstediğiniz zaman iptal edebilirsiniz.
        </span>
      </header>
      <section className="overflow-hidden text-sm text-neutral-600 md:text-base">
        <div className="grid gap-5 lg:grid-cols-3 xl:gap-8">{plans.map(renderPricingItem)}</div>
      </section>
    </div>
  )
}
