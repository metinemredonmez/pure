import { Metadata } from 'next'
import { getSiteSettings } from '@/lib/site-settings'
import { resolveImageUrl } from '@/lib/adapters'
import B2BForm from './B2BForm'

const ICON_PATHS: Record<string, string> = {
  price: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  leaf: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z',
  truck: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.079-.481 1.006-1.097C20.668 12.087 18.933 6.75 15.75 6.75H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125',
  cap: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342',
  tag: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z',
  person: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
}

function renderB2BIcon(name: string) {
  const path = ICON_PATHS[name] || ICON_PATHS['price']
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {path.split(' M').map((p, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={i === 0 ? p : `M${p}`} />
      ))}
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'Kurumsal Satış',
  description: 'Pure Olentia kurumsal kahve çözümleri. Ofis, restoran, otel ve kafeler için özel fiyatlarla specialty kahve tedariği.',
}


export default async function B2BPage() {
  const settings = await getSiteSettings()
  const heroImage = settings.b2bHeroImage ? resolveImageUrl(settings.b2bHeroImage) : ''

  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero — admin-managed image varsa onu kullan, yoksa hafif kahve arka plan + gradient */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-900 to-neutral-900"
        style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {heroImage && <div className="absolute inset-0 bg-black/55" aria-hidden />}
        {/* Admin görseli yoksa: hafif blurlu kahve görseli ambient olarak görünür */}
        {!heroImage && (
          <>
            <div
              className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15 blur-sm"
              style={{ backgroundImage: 'url(/hero/brazil-santos.jpg)' }}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-900/60 via-transparent to-neutral-950/40" aria-hidden />
          </>
        )}
        <div className="relative z-10 container py-20 text-center text-white lg:py-28">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide uppercase backdrop-blur-sm">
            {settings.b2bHeroBadge}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">
            {settings.b2bHeroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            {settings.b2bHeroSubtitle}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#form" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-800 transition hover:bg-white/90">
              {settings.b2bHeroPrimaryCta}
            </a>
            <a href="/franchise" className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              {settings.b2bHeroSecondaryCta}
            </a>
          </div>
        </div>
      </div>

      {/* Stats — pop out from hero via negative margin, white card stays above gradient */}
      <div className="container relative z-10 -mt-12 lg:-mt-16">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {(settings.b2bStats || []).map((s, i) => (
            <div key={s.id || i} className="rounded-2xl border border-neutral-100 bg-white p-5 text-center shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
              <div className="text-2xl font-bold text-primary-700 dark:text-amber-400">{s.value}</div>
              <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        {/* Features */}
        <div className="mx-auto mt-20 max-w-5xl">
          <h2 className="text-center text-2xl font-semibold">Neden Pure Olentia?</h2>
          <p className="mt-3 text-center text-neutral-500 dark:text-neutral-400">
            İşletmenize özel çözümlerimiz
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(settings.b2bFeatures || []).map((f, i) => (
              <div
                key={f.id || i}
                className="group rounded-2xl border border-neutral-100 p-6 transition-all hover:border-primary-200 hover:shadow-md dark:border-neutral-700 dark:hover:border-primary-700"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400">
                  {renderB2BIcon(f.icon)}
                </div>
                <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div id="form" className="mx-auto mt-24 max-w-xl scroll-mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Teklif Alın</h2>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              Formu doldurun, 24 saat içinde size dönelim.
            </p>
          </div>
          <B2BForm />
        </div>
      </div>
    </div>
  )
}
