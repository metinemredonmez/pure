import { Divider } from '@/components/Divider'
import Heading from '@/components/Heading/Heading'
import SectionClientSay from '@/components/SectionClientSay'
import SectionCollectionSlider from '@/components/SectionCollectionSlider'
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems'
import SectionHero2 from '@/components/SectionHero/SectionHero2'
import SectionPromo1 from '@/components/SectionPromo1'
import SectionPromo2 from '@/components/SectionPromo2'
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import SectionMagazine5 from '@/components/blog/SectionMagazine5'
import { getBlogPosts, getCollections as getStaticCollections, getProducts as getStaticProducts } from '@/data/data'
import { getApiProducts, getApiCategories, getApiCollections } from '@/lib/api'
import { adaptProduct, adaptCategory, adaptCollection } from '@/lib/adapters'
import { Button } from '@/shared/Button/Button'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
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

  const blogPosts = await getBlogPosts()

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

  const heroSlides = HERO_CONFIG.map((h) => {
    const slug = h.slugs.find((s) => bySlug[s]) || h.fallbackSlug
    const p = bySlug[slug]
    return {
      id: p?.id || slug,
      imageUrl: h.imageUrl,
      heading: h.title, // prefer our curated title over backend name
      subHeading: h.subHeading,
      btnText: 'Ürünü İncele',
      btnHref: `/products/${slug}`,
    }
  })

  return (
    <div className="nc-PageHome relative overflow-hidden">
      <SectionHero2 slides={heroSlides} />
      <SectionCollectionSlider className="mt-24 lg:mt-32" collections={featuredCollections} />

      <div className="relative container my-24 flex flex-col gap-y-24 lg:my-32 lg:gap-y-32">
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
        <Divider />
        <div>
          <Heading headingDim="Pure Olentia Blog">Son Yazılar</Heading>
          <SectionMagazine5 posts={blogPosts} />
          <div className="mt-20 flex justify-center">
            <Button href="/blog" outline>
              Tüm Blog Yazıları
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Divider />
        <SectionClientSay />
      </div>
    </div>
  )
}

export default PageHome
