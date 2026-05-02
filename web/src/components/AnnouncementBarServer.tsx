import { getSiteSettings } from '@/lib/site-settings'
import AnnouncementBar from './AnnouncementBar'

/**
 * Server component wrapper. Reads `announcements` array from site
 * settings and passes rotating items to the client AnnouncementBar.
 *
 * Admin → Site Ayarları → Duyuru Çubuğu kartından yönetilir.
 */
export default async function AnnouncementBarServer() {
  const settings = await getSiteSettings()
  const items = settings.announcements
    ?.map((it) => ({
      text: String(it?.text || ''),
      href: String(it?.href || '/collections/all'),
      cta: String(it?.cta || 'İncele'),
    }))
    .filter((it) => it.text)

  return <AnnouncementBar announcements={items && items.length ? items : undefined} />
}
