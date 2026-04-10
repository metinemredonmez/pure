import CmsPage from '@/components/CmsPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menşei Hikayeleri',
  description: 'Pure Olentia kahvelerinin geldiği topraklar: Etiyopya, Kolombiya, Brezilya, Kenya ve daha fazlası.',
}

function Fallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">Kahve Dünyası</span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Menşei Hikayeleri
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Her fincanın arkasında bir toprak, bir çiftçi, bir hikaye. Bu sayfa admin panelinden yönetilmektedir.
        </p>
      </div>
    </div>
  )
}

export default function MenseilerPage() {
  return <CmsPage slug="menseiler" kicker="Kahve Dünyası" fallback={<Fallback />} />
}
