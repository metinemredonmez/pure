import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular',
  description: 'Pure Olentia kahveleri, abonelik, kargo ve daha fazlası hakkında sıkça sorulan sorular.',
}

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Sıkça Sorulan Sorular</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir. Eğer içerik görünmüyorsa lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    </div>
  )
}

// /sss içeriği admin'den /admin/website/pages → "sss" sayfası üzerinden yönetiliyor.
// Önceki hardcoded faqGroups + SssFaq.tsx dead code'du, kaldırıldı.
export default function Page() {
  return <CmsPage slug="sss" kicker="Sıkça Sorulanlar" fallback={<Fallback />} />
}
