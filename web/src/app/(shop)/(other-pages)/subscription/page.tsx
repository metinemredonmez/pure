import { apiGetSubscriptionPlans } from '@/lib/api'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { CheckIcon } from '@heroicons/react/24/solid'
import SubscriptionTabs from './SubscriptionTabs'

export const metadata = {
  title: 'Abonelik',
  description: 'Pure Olentia kahve abonelik planları. Bireysel ve kurumsal seçenekler, 3/6/12 aylık paketler.',
}

function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return '₺0'
  return `₺${num.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default async function PageSubscription() {
  let backendPlans: any[] = []
  try {
    const res = (await apiGetSubscriptionPlans()) as any
    const list: any[] = res?.data || res || []
    if (Array.isArray(list) && list.length) backendPlans = list
  } catch {}

  // Build plan data for the tabs
  const bireyselPlans = [
    {
      period: '3 Ay',
      months: 3,
      discount: 10,
      features: ['Her ay 250g taze kahve', 'Farklı menşei her ay', 'Demleme rehberi', 'Ücretsiz kargo'],
      basePrice: backendPlans[0]?.priceMonthly ? Number(backendPlans[0].priceMonthly) : 199,
    },
    {
      period: '6 Ay',
      months: 6,
      discount: 15,
      popular: true,
      features: ['Her ay 250g taze kahve', 'İki farklı menşei', 'Demleme rehberi', 'Öncelikli teslimat', 'Özel indirimler'],
      basePrice: backendPlans[0]?.priceMonthly ? Number(backendPlans[0].priceMonthly) : 199,
    },
    {
      period: '12 Ay',
      months: 12,
      discount: 20,
      features: ['Her ay 250g taze kahve', 'Üç farklı menşei', 'Özel kavurma tercihi', 'Öncelikli teslimat', '%15 ekipman indirimi', 'Q Grader notları'],
      basePrice: backendPlans[0]?.priceMonthly ? Number(backendPlans[0].priceMonthly) : 199,
    },
  ]

  const kurumsalPlans = [
    {
      period: '3 Ay',
      months: 3,
      discount: 15,
      features: ['Her ay 1kg taze kahve', 'Özel blend seçimi', 'Barista desteği', 'Ücretsiz kargo', 'Fatura kesimi'],
      basePrice: backendPlans[2]?.priceMonthly ? Number(backendPlans[2].priceMonthly) : 899,
    },
    {
      period: '6 Ay',
      months: 6,
      discount: 20,
      popular: true,
      features: ['Her ay 3kg taze kahve', 'Özel blend geliştirme', 'Barista eğitimi', 'Öncelikli teslimat', 'Fatura kesimi', 'Ekipman indirimi'],
      basePrice: backendPlans[2]?.priceMonthly ? Number(backendPlans[2].priceMonthly) : 899,
    },
    {
      period: '12 Ay',
      months: 12,
      discount: 25,
      features: ['Her ay 5kg+ taze kahve', 'Tamamen özel blend', 'Tam barista desteği', 'Öncelikli teslimat', 'Fatura kesimi', 'Ekipman dahil', 'Aylık raporlama'],
      basePrice: backendPlans[2]?.priceMonthly ? Number(backendPlans[2].priceMonthly) : 899,
    },
  ]

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

      <SubscriptionTabs
        bireyselPlans={bireyselPlans}
        kurumsalPlans={kurumsalPlans}
      />
    </div>
  )
}
