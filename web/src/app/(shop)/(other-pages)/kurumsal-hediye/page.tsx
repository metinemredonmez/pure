import { GiftIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Kurumsal Hediye',
  description: 'Pure Olentia kurumsal hediye paketleri. Çalışanlarınıza, müşterilerinize özel kahve hediyesi.',
}

const ACCENTS = [
  'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
  'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
  'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
  'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20',
]

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Kurumsal Hediye</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir.
        </p>
      </div>
    </div>
  )
}

export default async function Page() {
  const settings = await getSiteSettings()
  const sets = settings.giftSets || []

  return (
    <div>
      {/* Hediye seti kartları — admin: Site Ayarları → Sayfa İçerikleri */}
      {sets.length > 0 && (
        <div className="container pt-12 pb-6">
          <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Hediye Setlerimiz</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-neutral-500 dark:text-neutral-400">
            Sevdikleriniz veya kurumsal ilişkileriniz için hazır hediye paketleri
          </p>
          <div className={`mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-${Math.min(sets.length, 4)}`}>
            {sets.map((g, idx) => (
              <div
                key={g.id}
                className={`rounded-2xl border border-neutral-200 bg-gradient-to-br ${ACCENTS[idx % ACCENTS.length]} p-6 dark:border-neutral-700`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-neutral-800">
                  <HugeiconsIcon icon={GiftIcon} size={28} color="currentColor" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">{g.name}</h3>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{g.desc}</p>
                {g.price && (
                  <div className="mt-4 text-lg font-bold text-primary-700 dark:text-primary-400">{g.price}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <CmsPage slug="kurumsal-hediye" kicker="Kurumsal" fallback={<Fallback />} />
    </div>
  )
}
