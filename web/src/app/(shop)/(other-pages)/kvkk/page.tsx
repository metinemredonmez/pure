import CmsPage from '@/components/CmsPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: 'Pure Olentia KVKK kapsamında kişisel verilerin korunması aydınlatma metni.',
}

function Fallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">Yasal</span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          KVKK Aydınlatma Metni
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni. Bu sayfa admin panelinden
          yönetilmektedir.
        </p>
      </div>
    </div>
  )
}

export default function KvkkPage() {
  return <CmsPage slug="kvkk" kicker="Yasal" fallback={<Fallback />} />
}
