import { Metadata } from 'next'
import SubscriptionPage from './SubscriptionPage'

export const metadata: Metadata = {
  title: 'Kahve Aboneliği',
  description: 'Pure Olentia kahve aboneliği. Taze kavrulmuş specialty kahve her ay kapınızda.',
}

export default function Page() {
  return <SubscriptionPage />
}
