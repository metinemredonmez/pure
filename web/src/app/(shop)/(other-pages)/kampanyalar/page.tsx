import CmsPage from '@/components/CmsPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kampanyalar',
  description: 'Pure Olentia güncel kampanyalar, indirimler ve fırsatlar.',
}

function Fallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">Fırsatlar</span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Kampanyalar
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Güncel indirim ve fırsatlar. Bu sayfa admin panelinden yönetilmektedir.
        </p>
      </div>
    </div>
  )
}

export default function KampanyalarPage() {
  return <CmsPage slug="kampanyalar" kicker="Fırsatlar" fallback={<Fallback />} />
}
