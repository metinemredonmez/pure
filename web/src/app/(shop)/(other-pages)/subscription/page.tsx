import { Metadata } from 'next'
import { getSiteSettings } from '@/lib/site-settings'
import SubscriptionPage from './SubscriptionPage'

export const metadata: Metadata = {
  title: 'Kahve Aboneliği',
  description: 'Pure Olentia kahve aboneliği. Taze kavrulmuş specialty kahve her ay kapınızda.',
}

export default async function Page() {
  const settings = await getSiteSettings()
  return (
    <SubscriptionPage
      heroBadge={settings.subscriptionHeroBadge}
      heroTitle={settings.subscriptionHeroTitle}
      heroSubtitle={settings.subscriptionHeroSubtitle}
      heroCta={settings.subscriptionHeroCta}
      steps={settings.subscriptionSteps}
      faqHeading={settings.subscriptionFaqHeading}
      faq={settings.subscriptionFaq}
      faqCta={settings.subscriptionFaqCta}
    />
  )
}
