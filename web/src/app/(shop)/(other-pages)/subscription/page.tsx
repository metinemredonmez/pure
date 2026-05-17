import { Metadata } from 'next'
import { resolveImageUrl } from '@/lib/adapters'
import { getSiteSettings } from '@/lib/site-settings'
import SubscriptionPage from './SubscriptionPage'

export const metadata: Metadata = {
  title: 'Kahve Aboneliği',
  description: 'Pure Olentia kahve aboneliği. Taze kavrulmuş specialty kahve her ay kapınızda.',
}

// Admin'in değişikliği anında siteye yansısın diye cache kapalı
export const revalidate = 0

export default async function Page() {
  const settings = await getSiteSettings()

  // Süre indirimleri
  const durationDiscounts: Record<number, number> = {}
  const dd = settings.subscriptionDurationDiscounts
  if (Array.isArray(dd)) {
    dd.forEach((d) => {
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
      config={settings.subscriptionConfig}
      durationDiscounts={durationDiscounts}
    />
  )
}
