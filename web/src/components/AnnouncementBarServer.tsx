import { getSiteSettings } from '@/lib/site-settings'
import AnnouncementBar, { AnnouncementItem } from './AnnouncementBar'

/**
 * Server component wrapper. Reads `announcementText` from backend
 * site settings and passes rotating items to the client AnnouncementBar.
 *
 * The backend can store:
 *   1. A single string: one announcement shown statically
 *   2. Multiple items separated by ` | ` (pipe with spaces): each
 *      item becomes a rotating slide
 *   3. Full JSON array (future): if `announcementText` parses as JSON
 *      array, each element can be { text, href, cta }
 *
 * If the setting is empty, the client component falls back to its
 * default rotation.
 */
export default async function AnnouncementBarServer() {
  const settings = await getSiteSettings()
  const raw = (settings as any).announcementText || (settings as any).announcement_text || ''

  let items: AnnouncementItem[] | undefined

  if (raw && typeof raw === 'string') {
    // Try JSON parse first (admin could store a JSON array)
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        items = parsed
          .map((it: any) => ({
            text: String(it?.text || ''),
            href: String(it?.href || '/collections/all'),
            cta: String(it?.cta || 'İncele'),
          }))
          .filter((it) => it.text)
      }
    } catch {
      // Fallback: split on ' | ' for multiple, else single item
      const pieces = raw
        .split(' | ')
        .map((s: string) => s.trim())
        .filter(Boolean)
      items = pieces.map((text) => ({
        text,
        href: '/collections/all',
        cta: 'İncele',
      }))
    }
  }

  return <AnnouncementBar announcements={items && items.length ? items : undefined} />
}
