import { Divider } from '@/components/Divider'
import Heading from '@/components/Heading/Heading'
import SectionCollectionSlider from '@/components/SectionCollectionSlider'
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems'
import SectionHero2 from '@/components/SectionHero/SectionHero2'
import SectionPromo1 from '@/components/SectionPromo1'
import SectionPromo2 from '@/components/SectionPromo2'
import SectionPromo3 from '@/components/SectionPromo3'
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import { getCollections as getStaticCollections, getProducts as getStaticProducts } from '@/data/data'
import { getApiProducts, getApiCategories, getApiCollections, getApiBanners } from '@/lib/api'
import { adaptProduct, adaptCategory, adaptCollection, resolveImageUrl } from '@/lib/adapters'
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

  // Use backend collections for featured, fallback to categories
  const featuredCollections = collections.length ? collections.slice(0, 4) : categories.slice(0, 4)

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
      slugs: ['brazil-santos'],
      fallbackSlug: 'brazil-santos',
      title: 'Brazil Vila Boa — Filtre Kahve',
      subHeading: 'Brezilya menşeili filtre kahve',
      imageUrl: '/hero/brazil-santos.jpg',
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

  // Prefer admin-managed HeroBanner records; fall back to curated HERO_CONFIG
  const heroSlides = backendBanners.length
    ? backendBanners
        .filter((b: any) => b?.image)
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((b: any) => ({
          id: b.id,
          imageUrl: resolveImageUrl(b.image),
          heading: b.title || 'Pure Olentia',
          subHeading: b.subtitle || '',
          btnText: b.ctaText || 'İncele',
          btnHref: b.ctaUrl || '/collections/all',
        }))
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
      <SectionCollectionSlider className="mt-24 lg:mt-32" collections={featuredCollections} />

      <div className="relative container mt-24 flex flex-col gap-y-24 lg:mt-32 lg:gap-y-32">
        <SectionSliderProductCard data={carouselProducts1} />
        <Divider />
        <SectionPromo1 />
        <SectionSliderProductCard
          data={carouselProducts2}
          heading="Çok Satanlar"
          subHeading="En sevilen kahvelerimiz"
        />
        <SectionPromo2 />
        <SectionSliderLargeProduct products={carouselProducts3} />
        <SectionGridFeatureItems data={products} />
      </div>

      {/* Newsletter — tight spacing, no extra top padding */}
      <div className="container mt-12 pb-16 lg:mt-16 lg:pb-24">
        <SectionPromo3 />
      </div>
    </div>
  )
}

export default PageHome
