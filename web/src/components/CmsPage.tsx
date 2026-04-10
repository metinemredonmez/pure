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
 * Server component that tries to render a CMS page from backend first,
 * falling back to provided static content when the admin has not yet
 * created a Page record for the given slug.
 *
 * Backend Page model stores `sections` as JSON. We support two simple
 * shapes:
 *   1. `[{ type: 'html', content: '<p>...</p>' }]`   — raw HTML
 *   2. `[{ type: 'markdown', content: '# Title...' }]` — (future) markdown
 *
 * Admin CRUD for these pages lives at /website/pages in the admin panel.
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
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl lg:my-24">
        {kicker && (
          <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">{kicker}</span>
        )}
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          {cmsPage.title}
        </h1>
        {cmsPage.seoDescription && (
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">{cmsPage.seoDescription}</p>
        )}
      </div>

      <article className="prose prose-sm mx-auto max-w-3xl sm:prose lg:prose-lg dark:prose-invert">
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

      {footer}
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
