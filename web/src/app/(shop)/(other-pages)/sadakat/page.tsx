import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Sadakat Programı',
  description: 'Pure Olentia sadakat programı. Her alışverişte puan kazanın, özel indirimler ve hediyeler kazanın.',
}

// Renk paleti — admin'de tier emoji'sine göre rastgele assign edilir
const TIER_THEMES = [
  { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
  { bg: 'bg-neutral-100 dark:bg-neutral-800', border: 'border-neutral-300 dark:border-neutral-700' },
  { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300 dark:border-yellow-700' },
  { bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-sky-300 dark:border-sky-700' },
  { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-300 dark:border-purple-700' },
]

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Sadakat Programı</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir.
        </p>
      </div>
    </div>
  )
}

export default async function Page() {
  const settings = await getSiteSettings()
  const tiers = settings.loyaltyTiers || []

  return (
    <div>
      {/* Üyelik seviyesi kartları — admin: Site Ayarları → Sayfa İçerikleri */}
      {tiers.length > 0 && (
        <div className="container pt-12 pb-6">
          <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Üyelik Seviyeleri</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-neutral-500 dark:text-neutral-400">
            Daha çok alışveriş yaptıkça üst seviyeye çıkın, avantajlarınız artsın.
          </p>
          <div className={`mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-${Math.min(tiers.length, 5)}`}>
            {tiers.map((tier, idx) => {
              const theme = TIER_THEMES[idx % TIER_THEMES.length]
              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl border ${theme.border} ${theme.bg} p-5 text-center`}
                >
                  <div className="text-3xl">{tier.emoji}</div>
                  <h3 className="mt-2 text-base font-bold text-neutral-900 dark:text-white">{tier.name}</h3>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{tier.points}</p>
                  <ul className="mt-3 space-y-1 text-left text-xs text-neutral-700 dark:text-neutral-300">
                    {tier.benefits.map((b, i) => (
                      <li key={i}>· {b}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <CmsPage slug="sadakat" kicker="Üyelik" fallback={<Fallback />} />
    </div>
  )
}
