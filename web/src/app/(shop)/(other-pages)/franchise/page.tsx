import { KeyIcon, Award01Icon, CoffeeIcon, Megaphone01Icon, AnalyticsUpIcon, CallIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import { resolveImageUrl } from '@/lib/adapters'
import { getSiteSettings } from '@/lib/site-settings'
import FranchiseForm from './FranchiseForm'
import FranchiseBanner from './FranchiseBanner'

export const metadata: Metadata = {
  title: 'Franchise Başvurusu',
  description: 'Pure Olentia franchise başvurusu. Kendi kahve dükkânınızı açın.',
}

const ICONS: Record<string, any> = {
  key: KeyIcon,
  award: Award01Icon,
  coffee: CoffeeIcon,
  megaphone: Megaphone01Icon,
  analytics: AnalyticsUpIcon,
}

export default async function FranchisePage() {
  const settings = await getSiteSettings()
  const heroImage = settings.franchiseHeroImage ? resolveImageUrl(settings.franchiseHeroImage) : '/hero/franchise-bg.jpg'
  const phoneClean = (settings.franchisePhone || '').replace(/[^0-9+]/g, '')

  return (
    <div className="overflow-x-hidden pb-24 lg:pb-32">
      {/* Hero — admin'den yönetilen arka plan + metinler */}
      <div
        className="relative overflow-hidden pb-16"
        style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/40" aria-hidden />
        <div className="container relative z-10 py-20 text-center text-white lg:py-28">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
            {settings.franchiseHeroBadge}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {settings.franchiseHeroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            {settings.franchiseHeroSubtitle}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#form" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary-800 shadow-lg transition hover:bg-neutral-100">
              Başvuru Yap
            </a>
            {settings.franchisePhone && (
              <a
                href={`tel:${phoneClean}`}
                className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <HugeiconsIcon icon={CallIcon} size={16} color="currentColor" strokeWidth={1.5} /> {settings.franchisePhone}
              </a>
            )}
          </div>
        </div>

        {/* Stats — admin'den yönetilen */}
        <div className="container relative z-10">
          <div className={`mx-auto grid max-w-3xl gap-4 grid-cols-2 sm:grid-cols-${Math.min(settings.franchiseStats.length, 4)}`}>
            {settings.franchiseStats.map((s) => (
              <div key={s.id} className="rounded-2xl bg-white p-5 text-center shadow-lg dark:bg-neutral-800">
                <div className="text-2xl font-bold text-primary-700">{s.value}</div>
                <div className="mt-1 text-xs text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mağaza konsepti carousel (admin → Site Ayarları → B2B/Kurumsal → franchiseBanners) */}
      <div className="container mt-20">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Pure Olentia Mağaza Konsepti</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-500 dark:text-neutral-400">
          Modern ve sıcak atmosferde specialty kahve deneyimi
        </p>
        <FranchiseBanner />
      </div>

      {/* Benefits — admin'den yönetilen */}
      <div className="container mt-24">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Franchise Avantajları</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-500 dark:text-neutral-400">
          Pure Olentia franchise modeli ile aldığınız destekler
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {settings.franchiseBenefits.map((b) => {
            const IconComponent = ICONS[b.icon] || KeyIcon
            return (
              <div key={b.id} className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl transition-transform group-hover:scale-110 dark:bg-primary-900/30">
                  <HugeiconsIcon icon={IconComponent} size={24} color="currentColor" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{b.title}</h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{b.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Form */}
      <div id="form" className="container mt-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 lg:p-10">
            <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Franchise Başvurusu</h2>
            <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Formu doldurun, ekibimiz 3 iş günü içinde size dönüş yapsın.
            </p>
            <div className="mt-8">
              <FranchiseForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
