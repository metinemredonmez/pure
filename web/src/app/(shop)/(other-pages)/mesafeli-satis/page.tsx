import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'Mesafeli Satis Sozlesmesi',
  description: 'Pure Olentia mesafeli satis sozlesmesi ve tuketici haklari.',
}

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Mesafeli Satis Sozlesmesi</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir. Eğer içerik görünmüyorsa lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="mesafeli-satis" kicker="Yasal Bilgiler" fallback={<Fallback />} />
}
