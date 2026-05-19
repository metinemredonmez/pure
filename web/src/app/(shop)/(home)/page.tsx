import { Divider } from '@/components/Divider'
import Heading from '@/components/Heading/Heading'
import SectionCollectionSlider from '@/components/SectionCollectionSlider'
import SectionGoogleReviews from '@/components/SectionGoogleReviews'
import SectionHero2 from '@/components/SectionHero/SectionHero2'
import SectionPromo1 from '@/components/SectionPromo1'
import SectionPromo2 from '@/components/SectionPromo2'
import SectionPromo3 from '@/components/SectionPromo3'
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import { getCollections as getStaticCollections, getProducts as getStaticProducts } from '@/data/data'
import { getApiProducts, getApiCategories, getApiCollections, getApiBanners } from '@/lib/api'
import { adaptProduct, adaptCategory, adaptCollection, resolveImageUrl } from '@/lib/adapters'
import { getSiteSettings } from '@/lib/site-settings'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ana Sayfa',
  description: 'Pure Olentia - Tarladan fincana izlenebilir specialty kahve deneyimi.',
}

async function PageHome() {
  // Try backend API first, fallback to static data
  let products: any[] = []
  let categories: any[] = []
  let collections: any[] = []

  let backendBanners: any[] = []

  const settings = await getSiteSettings()

  try {
    const apiProducts = await getApiProducts({ limit: 20 }) as any
    const prodData = apiProducts?.data?.data || apiProducts?.data || []
    if (Array.isArray(prodData) && prodData.length) {
      products = prodData.map((p: any, i: number) => adaptProduct(p, i))
    }

    const apiCategories = await getApiCategories() as any
    const catData = apiCategories?.data || apiCategories || []
    if (Array.isArray(catData) && catData.length) {
      categories = catData.map((c: any, i: number) => adaptCategory(c, i))
    }

    const apiCollections = await getApiCollections() as any
    const colData = apiCollections?.data || apiCollections || []
    if (Array.isArray(colData) && colData.length) {
      collections = colData.map((c: any, i: number) => adaptCollection(c, i))
    }

    // Fetch hero banners from backend (admin-managed via /website/banners)
    const apiBanners = await getApiBanners() as any
    const bannerData = apiBanners?.data || apiBanners || []
    if (Array.isArray(bannerData) && bannerData.length) {
      backendBanners = bannerData
    }
  } catch (e) {
    console.warn('API unavailable, using static data')
  }

  // Fallback to static data if API returned nothing
  if (!products.length) {
    products = await getStaticProducts()
  }
  if (!categories.length) {
    const staticCollections = await getStaticCollections()
    categories = staticCollections.slice(0, 7)
  }

  const carouselProducts1 = products.slice(0, 5)
  const carouselProducts2 = products.slice(3, 10)
  const carouselProducts3 = products.slice(1, 5)

  // Anasayfada 3 koleksiyon kartı — TEK KAYNAK: Site Ayarları → "Anasayfa Koleksiyon Kartları".
  // Admin oradan yönetir (image+title+subtitle+link). Kart eksikse o slot gizlenir.
  // Eski DB Collections fallback'i kaldırıldı — kafa karışıklığını önlemek için.
  // (DB Collections hâlâ /collections/[slug] URL'leri için kullanılıyor; ayrı işlev.)
  const settingsCardColors = ['bg-primary-50', 'bg-secondary-50', 'bg-orange-50']

  // "Hepsini Gör" / koleksiyon kartı CTA URL'ini güvenli hale getir:
  // - Boşsa → /collections/all
  // - Tam URL ise → host çıkar, relatif yap
  // - Specific ürüne işaret ediyorsa (`/products/SLUG`) → "Hepsini Gör" anlamsız, /collections/all
  // - `/products` (slug yok) → bu route mevcut değil, /collections/all'a yönlendir
  // - Diğer relatif route'lar (örn. /collections/X, /abonelik) olduğu gibi korunur
  const normalizeListingCta = (raw: string | null | undefined): string => {
    if (!raw) return '/collections/all'
    let u = raw.trim().replace(/^https?:\/\/[^/]+/i, '')
    if (!u || u === '/') return '/collections/all'
    if (u === '/products' || u.startsWith('/products?')) return '/collections/all'
    if (/^\/products\/[^?]+/i.test(u)) return '/collections/all'
    return u
  }

  const featuredCollections = (settings.homeCollectionCards || [])
    .filter((c) => c?.image && (c?.title || c?.subtitle))
    .map((c, i) => ({
      id: c.id,
      // CollectionCard3 renders `title` as small eyebrow + `sortDescription` as large heading.
      title: c.title,
      description: c.subtitle,
      sortDescription: c.subtitle,
      handle: '',
      cardHref: normalizeListingCta(c.ctaUrl),
      color: settingsCardColors[i] || 'bg-primary-50',
      count: 0,
      image: { src: resolveImageUrl(c.image), width: 800, height: 600, alt: c.title || '' },
    }))

  // Hero slides: 3 curated Pure Olentia products with REAL product photos
  // Admin can later swap these via website/banners (HeroBanner model)
  const HERO_CONFIG: Array<{
    slugs: string[] // preferred slug order — use first found in products
    fallbackSlug: string
    title: string
    subHeading: string
    imageUrl: string // real Pure Olentia product photo
  }> = [
    {
      slugs: ['turk-kahvesi-100gr', 'turk-kahvesi-geleneksel'],
      fallbackSlug: 'turk-kahvesi-100gr',
      title: 'Türk Kahvesi 100gr',
      subHeading: 'Taş değirmenden gelen lezzet — 100gr tekli',
      imageUrl: '/hero/turk-kahvesi-100gr.jpg',
    },
    {
      slugs: ['turk-kahvesi-200gr', 'turk-kahvesi-geleneksel'],
      fallbackSlug: 'turk-kahvesi-200gr',
      title: 'Türk Kahvesi 200gr',
      subHeading: 'Geleneksel 200gr paket',
      imageUrl: '/hero/turk-kahvesi-200gr.jpg',
    },
  ]

  const bySlug: Record<string, any> = {}
  products.forEach((p: any) => {
    const s = p.handle || p.slug
    if (s) bySlug[s] = p
  })

  // Banner title'a göre ürün eşleştirme (admin ctaUrl boş bıraktıysa otomatik bul)
  const findProductByTitle = (title: string): any | null => {
    if (!title) return null
    const norm = (s: string) => s.toLowerCase().replace(/ı/g, 'i').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/[^a-z0-9 ]/g, '').trim()
    const n = norm(title)
    // 1) exact slug match
    const exact = products.find((p: any) => norm(p.handle || p.slug || '') === n.replace(/ /g, '-'))
    if (exact) return exact
    // 2) name contains all words
    const words = n.split(/\s+/).filter(Boolean)
    const partial = products.find((p: any) => {
      const pn = norm(p.title || p.name || '')
      return words.every((w: string) => pn.includes(w))
    })
    return partial || null
  }

  // Prefer admin-managed HeroBanner records; fall back to curated HERO_CONFIG
  const heroSlides = backendBanners.length
    ? backendBanners
        .filter((b: any) => b?.image)
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((b: any) => {
          // Banner'ın ctaUrl alanı boşsa title'dan otomatik ürün bul.
          // Hâlâ bulamazsa /collections/all'a düşer.
          let href = b.ctaUrl
          if (!href) {
            const matched = findProductByTitle(b.title || '')
            if (matched) href = `/products/${matched.handle || matched.slug}`
            else href = '/collections/all'
          }
          return {
            id: b.id,
            imageUrl: resolveImageUrl(b.image),
            heading: b.title || 'Pure Olentia',
            subHeading: b.subtitle || '',
            btnText: b.ctaText || 'İncele',
            btnHref: href,
          }
        })
    : HERO_CONFIG.map((h) => {
        const slug = h.slugs.find((s) => bySlug[s]) || h.fallbackSlug
        const p = bySlug[slug]
        return {
          id: p?.id || slug,
          imageUrl: h.imageUrl,
          heading: h.title,
          subHeading: h.subHeading,
          btnText: 'Ürünü İncele',
          btnHref: `/products/${slug}`,
        }
      })

  return (
    <div className="nc-PageHome relative overflow-hidden">
      <SectionHero2 slides={heroSlides} />
      <SectionCollectionSlider
        className="mt-24 lg:mt-32"
        collections={featuredCollections}
        heading={settings.homeCollectionsHeading}
        headingDim={settings.homeCollectionsSubHeading}
        cardCtaLabel={settings.homeCollectionCardCta}
      />

      <div className="relative container mt-24 flex flex-col gap-y-24 lg:mt-32 lg:gap-y-32">
        <SectionSliderProductCard
          data={carouselProducts1}
          heading={settings.homeNewArrivalsHeading}
          subHeading={settings.homeNewArrivalsSubHeading}
        />
        <Divider />
        <SectionPromo1 />
        <SectionSliderProductCard
          data={carouselProducts2}
          heading={settings.homeBestSellersHeading}
          subHeading={settings.homeBestSellersSubHeading}
        />
        <SectionPromo2 />
        <SectionSliderLargeProduct
          products={carouselProducts3}
          heading={settings.homeExpertsHeading}
          headingDim={settings.homeExpertsSubHeading}
          viewAllLabel={settings.homeViewAllLabel}
          viewAllCaption={settings.homeViewAllCaption}
        />

        {/* Google reviews carousel (data from /public/google-reviews) */}
        <SectionGoogleReviews />
      </div>

      {/* Newsletter — tight spacing, no extra top padding */}
      <div className="container mt-12 pb-16 lg:mt-16 lg:pb-24">
        <SectionPromo3 />
      </div>
    </div>
  )
}

export default PageHome
