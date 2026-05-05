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

  // Admin-uploaded hero image overrides; aksi halde varsayılan kahveli görsel
  const heroImage = cmsPage.heroImage ? resolveImageUrl(cmsPage.heroImage) : '/hero/cms-default-bg.jpg'
  const effectiveKicker = cmsPage.heroKicker || kicker

  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero — kompakt + kahveli arka plan */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/40" aria-hidden />

        <div className="container relative z-10 py-10 text-center text-white lg:py-14">
          {effectiveKicker && (
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide uppercase backdrop-blur-sm">
              {effectiveKicker}
            </span>
          )}
          <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">
            {cmsPage.title}
          </h1>
          {cmsPage.seoDescription && (
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/70">
              {cmsPage.seoDescription}
            </p>
          )}
        </div>
      </div>

      {/* Content — sade, /b2b sayfası ile tutarlı */}
      <div className="container py-12 lg:py-16">
        <article className="cms-content mx-auto max-w-3xl">
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
