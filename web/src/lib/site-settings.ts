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

export interface FooterMenuItem {
  label: string
  href: string
}

export interface FooterMenuGroup {
  id: string
  title: string
  items: FooterMenuItem[]
}

export interface NavMenuChild {
  id: string
  name: string
  href: string
  description?: string
}

export interface NavMenuItem {
  id: string
  name: string
  href: string
  children?: NavMenuChild[]
}

export interface MegaMenuGroup {
  id: string
  name: string
  items: NavMenuChild[]
}

export interface B2BFeature {
  id: string
  title: string
  desc: string
  icon: string  // hugeicon name (e.g. 'Coffee01Icon')
}

export interface B2BStat {
  id: string
  value: string
  label: string
}

export interface IconStep {
  id: string
  title: string
  desc: string
  icon: string  // 'coffee' | 'package' | 'truck' | 'gift'
}

export interface FaqItem {
  id: string
  q: string
  a: string
}

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
  promo1Image: string
  promo2Image: string
  promo3Title: string
  promo3Subtitle: string
  promo3Image: string
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
  b2bHeroImage: string
  b2bHeroBadge: string
  b2bHeroTitle: string
  b2bHeroSubtitle: string
  b2bHeroPrimaryCta: string
  b2bHeroSecondaryCta: string
  footerMenus: FooterMenuGroup[]
  navMenus: NavMenuItem[]
  megaMenu: MegaMenuGroup[]
  b2bFeatures: B2BFeature[]
  b2bStats: B2BStat[]
  subscriptionHeroBadge: string
  subscriptionHeroTitle: string
  subscriptionHeroSubtitle: string
  subscriptionHeroCta: string
  subscriptionSteps: IconStep[]
  subscriptionFaqHeading: string
  subscriptionFaq: FaqItem[]
  subscriptionFaqCta: string
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
  promo1Image: '',
  promo2Image: '',
  promo3Title: '',
  promo3Subtitle: '',
  promo3Image: '',
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
  b2bHeroImage: '',
  b2bHeroBadge: 'Kurumsal Çözümler',
  b2bHeroTitle: 'İşletmeniz için Premium Kahve Tedariği',
  b2bHeroSubtitle: 'Ofisiniz, restoranınız, oteliniz veya kafeniz için özel fiyatlarla specialty kahve tedarikçisi.',
  b2bHeroPrimaryCta: 'Teklif Alın',
  b2bHeroSecondaryCta: 'Franchise',
  footerMenus: [
    {
      id: 'kesfet',
      title: 'Keşfet',
      items: [
        { label: 'Blog', href: '/blog' },
        { label: 'Demleme Rehberi', href: '/demleme-rehberi' },
        { label: 'Kahve Sözlüğü', href: '/kahve-sozlugu' },
        { label: 'Ekipmanlar', href: '/ekipmanlar' },
        { label: 'Sadakat Programı', href: '/sadakat' },
      ],
    },
    {
      id: 'kurumsal',
      title: 'Kurumsal',
      items: [
        { label: 'Kurumsal Satış', href: '/b2b' },
        { label: 'Toptan Satış', href: '/toptan-satis' },
        { label: 'Kurumsal Hediye', href: '/kurumsal-hediye' },
        { label: 'Franchise', href: '/franchise' },
        { label: 'Abonelik', href: '/subscription' },
      ],
    },
    {
      id: 'destek',
      title: 'Destek',
      items: [
        { label: 'Sipariş Takibi', href: '/siparis-takibi' },
        { label: 'İade & Değişim', href: '/iade-degisim' },
        { label: 'Ödeme & Teslimat', href: '/odeme-teslimat' },
        { label: 'SSS', href: '/sss' },
        { label: 'İletişim', href: '/contact' },
      ],
    },
    {
      id: 'yasal',
      title: 'Yasal',
      items: [
        { label: 'Gizlilik Politikası', href: '/gizlilik-politikasi' },
        { label: 'KVKK', href: '/kvkk' },
        { label: 'Mesafeli Satış', href: '/mesafeli-satis' },
        { label: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
        { label: 'Çerez Politikası', href: '/cerez-politikasi' },
      ],
    },
  ],
  navMenus: [
    { id: 'kahveler', name: 'Kahveler', href: '/collections/all', children: [
      { id: 'turk-kahvesi', name: 'Türk Kahvesi', href: '/collections/turk-kahvesi', description: 'Geleneksel Türk kahvesi çeşitleri' },
      { id: 'filtre-kahve', name: 'Filtre Kahve', href: '/collections/filtre-kahve', description: 'Pour-over & filtre demleme' },
      { id: 'espresso', name: 'Espresso', href: '/collections/espresso', description: 'Espresso makineleri için özel' },
    ]},
    { id: 'abonelik', name: 'Abonelik', href: '/subscription', children: [
      { id: 'bireysel', name: 'Bireysel Abonelik', href: '/subscription' },
      { id: 'kurumsal-ab', name: 'Kurumsal Abonelik', href: '/b2b' },
    ]},
    { id: 'online-dukkan', name: 'Online Dükkan', href: '/collections/all' },
    { id: 'kesfet', name: 'Keşfet', href: '#', children: [
      { id: 'blog', name: 'Blog', href: '/blog' },
      { id: 'demleme', name: 'Demleme Rehberi', href: '/demleme-rehberi' },
      { id: 'sozluk', name: 'Kahve Sözlüğü', href: '/kahve-sozlugu' },
      { id: 'ekipman', name: 'Ekipmanlar', href: '/ekipmanlar' },
      { id: 'sadakat', name: 'Sadakat Programı', href: '/sadakat' },
    ]},
    { id: 'kurumsal', name: 'Kurumsal', href: '/b2b', children: [
      { id: 'kurumsal-satis', name: 'Kurumsal Satış', href: '/b2b' },
      { id: 'toptan', name: 'Toptan Satış', href: '/toptan-satis' },
      { id: 'hediye', name: 'Kurumsal Hediye', href: '/kurumsal-hediye' },
      { id: 'franchise', name: 'Franchise', href: '/franchise' },
      { id: 'abonelik2', name: 'Abonelik', href: '/subscription' },
    ]},
    { id: 'iletisim', name: 'İletişim', href: '/contact' },
  ],
  megaMenu: [
    { id: 'mensei', name: 'Menşei', items: [
      { id: 'ethiopia', name: 'Etiyopya', href: '/collections/ethiopia' },
      { id: 'colombia', name: 'Kolombiya', href: '/collections/colombia' },
      { id: 'brazil', name: 'Brezilya', href: '/collections/brazil' },
      { id: 'kenya', name: 'Kenya', href: '/collections/kenya' },
      { id: 'guatemala', name: 'Guatemala', href: '/collections/guatemala' },
    ]},
    { id: 'isleme', name: 'İşleme Yöntemi', items: [
      { id: 'washed', name: 'Yıkanmış (Washed)', href: '/collections/washed' },
      { id: 'natural', name: 'Doğal (Natural)', href: '/collections/natural' },
      { id: 'honey', name: 'Bal (Honey)', href: '/collections/honey' },
      { id: 'anaerobic', name: 'Anaerobik', href: '/collections/anaerobic' },
    ]},
    { id: 'kavurma', name: 'Kavurma Profili', items: [
      { id: 'light', name: 'Açık Kavurma', href: '/collections/light-roast' },
      { id: 'medium', name: 'Orta Kavurma', href: '/collections/medium-roast' },
      { id: 'dark', name: 'Koyu Kavurma', href: '/collections/dark-roast' },
    ]},
    { id: 'ekipman-mm', name: 'Ekipmanlar', items: [
      { id: 'grinder', name: 'Öğütücüler', href: '/collections/grinders' },
      { id: 'brewer', name: 'Demleme Ekipmanları', href: '/collections/brewers' },
      { id: 'accessory', name: 'Aksesuarlar', href: '/collections/accessories' },
      { id: 'sub-mm', name: 'Abonelik', href: '/subscription' },
    ]},
  ],
  b2bFeatures: [
    { id: 'pricing', title: 'Özel Fiyatlandırma', desc: 'Hacme göre özel indirimli fiyatlar ve esnek ödeme seçenekleri.', icon: 'price' },
    { id: 'roast', title: 'Özel Kavurma Profili', desc: 'Markanıza özel kavurma ve blend oluşturma imkanı.', icon: 'leaf' },
    { id: 'delivery', title: 'Planlı Teslimat', desc: 'Periyodik ve zamanında teslimat garantisi.', icon: 'truck' },
    { id: 'training', title: 'Barista Eğitimi', desc: 'Ekibinize profesyonel barista ve demleme eğitimi.', icon: 'cap' },
    { id: 'label', title: 'Özel Etiketleme', desc: 'Kendi markanızla paketleme ve white-label hizmeti.', icon: 'tag' },
    { id: 'manager', title: 'Kişisel Hesap Yöneticisi', desc: 'Size özel irtibat kişisi ve öncelikli destek.', icon: 'person' },
  ],
  b2bStats: [
    { id: 's1', value: '200+', label: 'Kurumsal Müşteri' },
    { id: 's2', value: '15+', label: 'Şehir' },
    { id: 's3', value: '%98', label: 'Memnuniyet' },
    { id: 's4', value: '24s', label: 'Teslimat' },
  ],
  subscriptionHeroBadge: 'Kahve Aboneliği',
  subscriptionHeroTitle: 'Taze Kavrulmuş Kahve <br /> ile Kapınıza Geliyoruz',
  subscriptionHeroSubtitle: 'Kahveleri hafta başında kavurup, ertesi gün kargoya veriyoruz. Seçtiğiniz süre boyunca taze kahvenizi sabit tutacak şekilde hareket ediyoruz.',
  subscriptionHeroCta: 'Abone Ol',
  subscriptionSteps: [
    { id: 'st1', title: 'Plan Seçin', desc: 'Size uygun paketi seçin', icon: 'coffee' },
    { id: 'st2', title: 'Taze Kavrulsun', desc: 'Sipariş üzerine kavrulur', icon: 'package' },
    { id: 'st3', title: 'Kapınıza Gelsin', desc: 'Ücretsiz hızlı kargo', icon: 'truck' },
    { id: 'st4', title: 'Her Ay Yeni Lezzet', desc: 'Farklı menşeiler', icon: 'gift' },
  ],
  subscriptionFaqHeading: 'Sıkça Sorulan Sorular',
  subscriptionFaq: [
    { id: 'q1', q: 'Aboneliğimi istediğim zaman iptal edebilir miyim?', a: 'Evet, aboneliğinizi dilediğiniz zaman hesabınızdan iptal edebilirsiniz.' },
    { id: 'q2', q: 'Kahve tercihimi değiştirebilir miyim?', a: 'Her teslimat öncesi tercihlerinizi değiştirebilirsiniz.' },
    { id: 'q3', q: 'Teslimat ne zaman yapılır?', a: 'Kahveniz seçtiğiniz periyotlarda taze kavrularak 1-3 iş günü içinde kargoya verilir.' },
    { id: 'q4', q: 'Planları kim düzenliyor?', a: 'Planlar, fiyatlar ve özellikler admin panelden yönetilir, bu sayfada her zaman güncel bilgi görürsünüz.' },
  ],
  subscriptionFaqCta: 'Kahveleri Keşfet',
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
      const incoming = data[key]
      if (incoming === undefined || incoming === null || incoming === '') continue
      if (key === 'footerMenus') {
        if (Array.isArray(incoming) && incoming.length) {
          merged.footerMenus = incoming as FooterMenuGroup[]
        }
        continue
      }
      if (key === 'navMenus') {
        if (Array.isArray(incoming) && incoming.length) {
          merged.navMenus = incoming as NavMenuItem[]
        }
        continue
      }
      if (key === 'megaMenu') {
        if (Array.isArray(incoming) && incoming.length) {
          merged.megaMenu = incoming as MegaMenuGroup[]
        }
        continue
      }
      if (key === 'b2bFeatures') {
        if (Array.isArray(incoming) && incoming.length) {
          merged.b2bFeatures = incoming as B2BFeature[]
        }
        continue
      }
      if (key === 'b2bStats') {
        if (Array.isArray(incoming) && incoming.length) {
          merged.b2bStats = incoming as B2BStat[]
        }
        continue
      }
      if (key === 'subscriptionSteps') {
        if (Array.isArray(incoming) && incoming.length) {
          merged.subscriptionSteps = incoming as IconStep[]
        }
        continue
      }
      if (key === 'subscriptionFaq') {
        if (Array.isArray(incoming) && incoming.length) {
          merged.subscriptionFaq = incoming as FaqItem[]
        }
        continue
      }
      ;(merged as any)[key] = coerce(incoming)
    }
    return merged
  } catch {
    return DEFAULTS
  }
}
