import { CoffeeIcon, Hotel01Icon, Building02Icon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Toptan Satış',
  description: 'Pure Olentia toptan kahve satış bilgileri. Kafeler, oteller, restoranlar için özel fiyat.',
}

const ICONS: Record<string, any> = {
  coffee: CoffeeIcon,
  hotel: Hotel01Icon,
  building: Building02Icon,
  cart: ShoppingCart01Icon,
}

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Toptan Satış</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir.
        </p>
      </div>
    </div>
  )
}

export default async function Page() {
  const settings = await getSiteSettings()
  const segments = settings.wholesaleSegments || []

  return (
    <div>
      {/* Segment kartları — admin: Site Ayarları → Sayfa İçerikleri */}
      {segments.length > 0 && (
        <div className="container pt-12 pb-6">
          <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Kimler için?</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-neutral-500 dark:text-neutral-400">
            İşletmeniz için özel toptan çözümler
          </p>
          <div className={`mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-${Math.min(segments.length, 4)}`}>
            {segments.map((s) => {
              const Icon = ICONS[s.icon] || CoffeeIcon
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/30">
                    <HugeiconsIcon icon={Icon} size={28} color="currentColor" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{s.desc}</p>
                  {s.minOrder && (
                    <div className="mt-3 inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                      Min. {s.minOrder}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <CmsPage slug="toptan-satis" kicker="Kurumsal" fallback={<Fallback />} />
    </div>
  )
}
