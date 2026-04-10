import BackgroundSection from '@/components/BackgroundSection/BackgroundSection'
import { Divider } from '@/components/Divider'
import Heading from '@/components/Heading/Heading'
import SectionClientSay from '@/components/SectionClientSay'
import SectionCollectionSlider from '@/components/SectionCollectionSlider'
import SectionCollectionSlider2 from '@/components/SectionCollectionSlider2'
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems'
import SectionGridMoreExplore from '@/components/SectionGridMoreExplore/SectionGridMoreExplore'
import SectionHero2 from '@/components/SectionHero/SectionHero2'
import SectionHowItWork from '@/components/SectionHowItWork/SectionHowItWork'
import SectionPromo1 from '@/components/SectionPromo1'
import SectionPromo2 from '@/components/SectionPromo2'
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import SectionMagazine5 from '@/components/blog/SectionMagazine5'
import { getBlogPosts, getCollections as getStaticCollections, getGroupCollections, getProducts as getStaticProducts } from '@/data/data'
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

  const groupCollections = await getGroupCollections()
  const blogPosts = await getBlogPosts()

  const carouselProducts1 = products.slice(0, 5)
  const carouselProducts2 = products.slice(3, 10)
  const carouselProducts3 = products.slice(1, 5)

  // Use backend collections for featured, fallback to categories
  const featuredCollections = collections.length ? collections.slice(0, 4) : categories.slice(0, 4)
  const departmentCollections = categories.slice(0, 4)

  // Hero slides: top-selling products from backend (fallback to defaults in component)
  const heroSlides = products.slice(0, 5).map((p: any, i: number) => ({
    id: p.id || i,
    imageUrl: p.featuredImage?.src || p.images?.[0]?.src || '',
    heading: p.title || p.name || 'Pure Olentia',
    subHeading: p.description?.slice(0, 80) || 'En çok tercih edilen kahvelerimiz',
    btnText: 'Ürünü İncele',
    btnHref: `/products/${p.handle || p.slug || ''}`,
  })).filter((s) => s.imageUrl)

  return (
    <div className="nc-PageHome relative overflow-hidden">
      <SectionHero2 slides={heroSlides} />
      <SectionCollectionSlider className="mt-24 lg:mt-32" collections={featuredCollections} />

      <div className="relative container my-24 flex flex-col gap-y-24 lg:my-32 lg:gap-y-32">
        <SectionSliderProductCard data={carouselProducts1} />
        <Divider />
        <div className="pb-16">
          <SectionHowItWork />
        </div>
        <SectionPromo1 />
        <div className="relative pt-24 pb-20 lg:pt-28">
          <BackgroundSection />
          <SectionGridMoreExplore groupCollections={groupCollections} />
        </div>
        <SectionSliderProductCard
          data={carouselProducts2}
          heading="Cok Satanlar"
          subHeading="En sevilen kahvelerimiz"
        />
        <SectionPromo2 />
        <SectionSliderLargeProduct products={carouselProducts3} />
        <SectionGridFeatureItems data={products} />
        <Divider />
        <SectionCollectionSlider2 collections={departmentCollections} />
        <Divider />
        <div>
          <Heading headingDim="Pure Olentia Blog">Son Yazilar</Heading>
          <SectionMagazine5 posts={blogPosts} />
          <div className="mt-20 flex justify-center">
            <Button href="/blog" outline>
              Tum blog yazilari
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
