import { getApiPage } from '@/lib/api'
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

  return (
    <div className="pb-24 lg:pb-32">
      {/* Colorful hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-amber-900 to-primary-950">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-amber-500/30 blur-3xl" />
          <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-yellow-500/20 blur-3xl" />
        </div>

        <div className="container relative py-20 lg:py-28 text-center text-white">
          {kicker && (
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
              {kicker}
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
      <div className="container -mt-8 relative">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white shadow-2xl p-8 sm:p-12 dark:bg-neutral-900 dark:shadow-neutral-950/50">
          <article
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none
              prose-headings:text-neutral-900 dark:prose-headings:text-white
              prose-headings:font-bold
              prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
              prose-h2:pb-2 prose-h2:border-b-2 prose-h2:border-amber-200 dark:prose-h2:border-amber-700/50
              prose-h3:text-xl prose-h3:text-amber-800 dark:prose-h3:text-amber-300 prose-h3:mt-8
              prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-p:leading-relaxed
              prose-a:text-primary-700 prose-a:font-semibold prose-a:no-underline hover:prose-a:text-primary-800
              prose-strong:text-neutral-900 dark:prose-strong:text-white
              prose-ul:my-4 prose-li:my-1 prose-li:text-neutral-700 dark:prose-li:text-neutral-300
              prose-blockquote:border-l-4 prose-blockquote:border-amber-500
              prose-blockquote:bg-amber-50 dark:prose-blockquote:bg-amber-900/20
              prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:rounded-r-lg
              prose-blockquote:not-italic prose-blockquote:text-amber-900 dark:prose-blockquote:text-amber-200
              prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-code:text-primary-700 dark:prose-code:text-amber-300 prose-code:font-normal
              prose-img:rounded-2xl prose-img:shadow-lg"
          >
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
