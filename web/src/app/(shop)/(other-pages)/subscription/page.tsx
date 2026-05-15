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

  // Fetch the 3 subscription plans from backend (admin manages name, description, image, sortOrder).
  // The package RULES (gramaj matrix, durations, frequencies) stay as code constants because they are
  // business rules defined in the spec, not editorial content.
  let planOverrides: { name?: string; description?: string; image?: string }[] = []
  try {
    const res = (await getApiSubscriptionPlans()) as any
    const list = res?.data?.data || res?.data || []
    if (Array.isArray(list)) {
      planOverrides = list
        .filter((p: any) => p.isActive !== false)
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .slice(0, 3)
        .map((p: any) => ({
          name: p.name,
          description: p.description,
          image: p.image ? resolveImageUrl(p.image) : undefined,
        }))
    }
  } catch {}

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
      planOverrides={planOverrides}
    />
  )
}
