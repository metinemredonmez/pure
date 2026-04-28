/**
 * Server-side helper to fetch site settings from backend with graceful
 * fallback to hardcoded defaults when the API is unavailable.
 *
 * Backend endpoint: GET /public/site-settings — returns a flat
 * { key: value } object sourced from the SiteSettings table which is
 * edited from admin → Web Sitesi → Site Ayarları.
 *
 * Keys must match the admin form field names:
 *   siteName, logo, favicon, footerText,
 *   phone, email, address, mapLat, mapLng, workingHours,
 *   facebook, instagram, twitter, linkedin, youtube,
 *   kvkkText, cookiePolicy
 */
import { getApiSiteSettings } from '@/lib/api'

export interface SiteSettings {
  siteName: string
  logo: string
  favicon: string
  footerText: string
  phone: string
  email: string
  address: string
  mapLat: string
  mapLng: string
  workingHours: string
  facebook: string
  instagram: string
  twitter: string
  linkedin: string
  youtube: string
  kvkkText: string
  cookiePolicy: string
  announcementText: string
  promo1Title: string
  promo1Subtitle: string
  promo1Cta: string
  promo2Title: string
  promo2Subtitle: string
  promo2Cta: string
  promo3Title: string
  promo3Subtitle: string
  homeCollectionsHeading: string
  homeCollectionsSubHeading: string
  homeNewArrivalsHeading: string
  homeNewArrivalsSubHeading: string
  homeBestSellersHeading: string
  homeBestSellersSubHeading: string
  homeExpertsHeading: string
  homeExpertsSubHeading: string
  homeViewAllLabel: string
  homeViewAllCaption: string
  homeCollectionCardCta: string
}

const DEFAULTS: SiteSettings = {
  siteName: 'Pure Olentia',
  logo: '/logo.png',
  favicon: '/icon.png',
  footerText: 'Tarladan fincana izlenebilir specialty kahve deneyimi.',
  phone: '0552 462 29 54',
  email: 'info@pureolentia.com',
  address: 'Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul',
  mapLat: '40.9961',
  mapLng: '29.2309',
  workingHours: 'Pzt-Cum 09:00-18:00',
  facebook: 'https://facebook.com/pureolentia',
  instagram: 'https://instagram.com/pureolentia',
  twitter: 'https://twitter.com/pureolentia',
  linkedin: 'https://linkedin.com/company/pureolentia',
  youtube: 'https://youtube.com/@pureolentia',
  kvkkText: '',
  cookiePolicy: '',
  announcementText: '',
  promo1Title: '',
  promo1Subtitle: '',
  promo1Cta: '',
  promo2Title: '',
  promo2Subtitle: '',
  promo2Cta: '',
  promo3Title: '',
  promo3Subtitle: '',
  homeCollectionsHeading: 'Daha fazla keşfet',
  homeCollectionsSubHeading: 'Sizin için seçilmiş koleksiyonlar',
  homeNewArrivalsHeading: 'Yeni Gelenler',
  homeNewArrivalsSubHeading: 'Taze kavrulmuş özel kahveler',
  homeBestSellersHeading: 'Çok Satanlar',
  homeBestSellersSubHeading: 'En sevilen kahvelerimiz',
  homeExpertsHeading: 'Uzmanlar seçti',
  homeExpertsSubHeading: 'Haftanın favorileri',
  homeViewAllLabel: 'Daha fazla',
  homeViewAllCaption: 'Tümünü gör',
  homeCollectionCardCta: 'Hepsini Gör',
}

function coerce(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  return String(value)
}

/**
 * Fetch site settings from backend. Safe to call in any server
 * component — revalidates every 60 seconds so admin edits propagate
 * without a redeploy.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = (await getApiSiteSettings()) as any
    const data = res?.data || res || {}

    // Merge with defaults so a missing key falls back to sane value
    const merged: SiteSettings = { ...DEFAULTS }
    for (const key of Object.keys(DEFAULTS) as (keyof SiteSettings)[]) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        merged[key] = coerce(data[key])
      }
    }
    return merged
  } catch {
    return DEFAULTS
  }
}
