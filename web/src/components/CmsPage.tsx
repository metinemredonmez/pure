import { getApiPage } from '@/lib/api'
import { resolveImageUrl } from '@/lib/adapters'
import { ReactNode } from 'react'

interface CmsPageProps {
  slug: string
  /** Fallback UI shown if no Page record exists in admin */
  fallback: ReactNode
  /** Optional kicker label above the title */
  kicker?: string
  /** Optional extra content rendered below the CMS body (e.g. forms) */
  footer?: ReactNode
}

/**
 * Server component that renders a CMS page from backend.
 * Admin CRUD lives at /website/pages.
 */
export default async function CmsPage({ slug, fallback, kicker, footer }: CmsPageProps) {
  let cmsPage: any = null
  try {
    const res = (await getApiPage(slug)) as any
    cmsPage = res?.data || res || null
  } catch {}

  if (!cmsPage || !cmsPage.isPublished) {
    return <>{fallback}</>
  }

  const sections: any[] = Array.isArray(cmsPage.sections)
    ? cmsPage.sections
    : typeof cmsPage.sections === 'string'
      ? safeParse(cmsPage.sections)
      : []

  // Admin-uploaded hero image overrides the gradient.
  // heroKicker takes precedence over the prop (per-page admin control).
  const heroImage = cmsPage.heroImage ? resolveImageUrl(cmsPage.heroImage) : ''
  const effectiveKicker = cmsPage.heroKicker || kicker

  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero — image if admin uploaded one, else colorful gradient */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-amber-900 to-primary-950"
        style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {heroImage ? (
          /* Dark overlay for text readability over image */
          <div className="absolute inset-0 bg-black/55" aria-hidden />
        ) : (
          /* Decorative blurs only when gradient is used */
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-amber-500/30 blur-3xl" />
            <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-yellow-500/20 blur-3xl" />
          </div>
        )}

        <div className="container relative py-20 lg:py-28 text-center text-white">
          {effectiveKicker && (
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
              {effectiveKicker}
            </span>
          )}
          <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-6xl leading-tight">
            {cmsPage.title}
          </h1>
          {cmsPage.seoDescription && (
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/80 sm:text-lg">
              {cmsPage.seoDescription}
            </p>
          )}
        </div>

        {/* Bottom fade to content */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent dark:from-neutral-950" />
      </div>

      {/* Content card */}
      <div className="container -mt-12 relative">
        <div className="mx-auto max-w-4xl">
          {/* Decorative background blobs */}
          <div className="pointer-events-none absolute -left-20 top-40 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-20 top-96 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" aria-hidden />

          <div className="relative rounded-3xl bg-white/90 backdrop-blur-sm shadow-2xl p-6 sm:p-10 lg:p-14 ring-1 ring-amber-100 dark:bg-neutral-900/90 dark:ring-amber-900/30 dark:shadow-neutral-950/50">
            <article className="cms-content max-w-none">
              {sections.map((section, i) => {
                if (!section) return null
                const { type, content } = section
                if (!content) return null
                if (type === 'html' || type === 'markdown' || !type) {
                  return <div key={i} dangerouslySetInnerHTML={{ __html: String(content) }} />
                }
                return null
              })}
            </article>
          </div>
        </div>

        {footer && <div className="mx-auto max-w-3xl mt-10">{footer}</div>}
      </div>
    </div>
  )
}

function safeParse(value: string): any[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
