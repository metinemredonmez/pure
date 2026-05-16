import { Metadata } from 'next'
import { getApiSubscriptionPlans } from '@/lib/api'
import { resolveImageUrl } from '@/lib/adapters'
import { getSiteSettings } from '@/lib/site-settings'
import SubscriptionPage from './SubscriptionPage'

export const metadata: Metadata = {
  title: 'Kahve Aboneliği',
  description: 'Pure Olentia kahve aboneliği. Taze kavrulmuş specialty kahve her ay kapınızda.',
}

export default async function Page() {
  const settings = await getSiteSettings()

  // Fetch all subscription plans from backend. Admin manages EVERYTHING:
  //   - Editorial: name, description, image, sortOrder
  //   - Config: coffee types + grams per type, durations, periods, mini-office bag multipliers
  //   All stored in SubPlan JSON columns (availableGrams / availableDurations / availablePeriods / availableGrinds).
  let plans: any[] = []
  try {
    const res = (await getApiSubscriptionPlans()) as any
    const list = res?.data?.data || res?.data || []
    if (Array.isArray(list)) {
      plans = list
        .filter((p: any) => p.isActive !== false)
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((p: any) => ({
          id: p.slug || p.id,
          name: p.name,
          description: p.description,
          image: p.image ? resolveImageUrl(p.image) : undefined,
          coffeeConfigs: Array.isArray(p.availableGrams) ? p.availableGrams : [],
          durations: Array.isArray(p.availableDurations) ? p.availableDurations : [],
          periods: Array.isArray(p.availablePeriods) ? p.availablePeriods : [],
          bagMultipliers: Array.isArray(p.availableGrinds) ? p.availableGrinds : [],
        }))
    }
  } catch {}

  // Global süre indirimleri (settings'ten) — varsayılan: 3:%0, 6:%5, 12:%10
  const durationDiscounts: Record<number, number> = {}
  const dd = (settings as any).subscriptionDurationDiscounts
  if (Array.isArray(dd)) {
    dd.forEach((d: any) => {
      if (typeof d?.months === 'number' && typeof d?.percent === 'number') {
        durationDiscounts[d.months] = d.percent
      }
    })
  }
  if (!Object.keys(durationDiscounts).length) {
    durationDiscounts[3] = 0
    durationDiscounts[6] = 5
    durationDiscounts[12] = 10
  }

  return (
    <SubscriptionPage
      heroBadge={settings.subscriptionHeroBadge}
      heroTitle={settings.subscriptionHeroTitle}
      heroSubtitle={settings.subscriptionHeroSubtitle}
      heroCta={settings.subscriptionHeroCta}
      heroImage={settings.subscriptionHeroImage ? resolveImageUrl(settings.subscriptionHeroImage) : ''}
      steps={settings.subscriptionSteps}
      faqHeading={settings.subscriptionFaqHeading}
      faq={settings.subscriptionFaq}
      faqCta={settings.subscriptionFaqCta}
      plans={plans}
      durationDiscounts={durationDiscounts}
    />
  )
}
