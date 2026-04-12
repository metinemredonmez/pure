import { Divider } from '@/components/Divider'
import SectionPromo1 from '@/components/SectionPromo1'
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct'
import { getCollectionByHandle, getProducts } from '@/data/data'
import { getApiCategories, getApiCollections, getApiProducts } from '@/lib/api'
import { adaptProduct } from '@/lib/adapters'
import { Metadata } from 'next'
import React from 'react'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params

  // Try backend categories first
  let title = 'Koleksiyon'
  let description = ''
  try {
    const apiCats = await getApiCategories() as any
    const cats = apiCats?.data || []
    const found = cats.find((c: any) => c.slug === handle)
    if (found) {
      title = found.name
      description = found.description || ''
    } else {
      const apiCols = await getApiCollections() as any
      const cols = apiCols?.data || []
      const foundCol = cols.find((c: any) => c.slug === handle)
      if (foundCol) {
        title = foundCol.name
        description = foundCol.description || ''
      }
    }
  } catch (e) {}

  if (title === 'Koleksiyon') {
    const collection = await getCollectionByHandle(handle)
    title = collection?.title || 'Koleksiyon'
    description = collection?.description || ''
  }

  return { title, description }
}

const Layout = async ({ children, params }: { children: React.ReactNode; params: Promise<{ handle: string }> }) => {
  const { handle } = await params

  // Get collection/category info from backend
  let title = ''
  let description = ''
  try {
    const apiCats = await getApiCategories() as any
    const cats = apiCats?.data || []
    const found = cats.find((c: any) => c.slug === handle)
    if (found) {
      title = found.name
      description = found.description || ''
    } else {
      const apiCols = await getApiCollections() as any
      const cols = apiCols?.data || []
      const foundCol = cols.find((c: any) => c.slug === handle)
      if (foundCol) {
        title = foundCol.name
        description = foundCol.description || ''
      }
    }
  } catch (e) {}

  // Fallback to static
  if (!title) {
    const collection = await getCollectionByHandle(handle)
    title = collection?.title || handle
    description = collection?.description || ''
  }

  // Related products
  let relatedProducts: any[] = []
  try {
    const apiRes = await getApiProducts({ limit: 4 }) as any
    const prodData = apiRes?.data?.data || apiRes?.data || []
    if (Array.isArray(prodData) && prodData.length) {
      relatedProducts = prodData.map((p: any, i: number) => adaptProduct(p, i))
    }
  } catch (e) {}
  if (!relatedProducts.length) {
    relatedProducts = (await getProducts()).slice(0, 4)
  }

  // Pretty titles for known handles
  const HANDLE_TITLES: Record<string, string> = {
    all: 'Tüm Kahveler',
    'turk-kahvesi': 'Türk Kahvesi',
    'filtre-kahve': 'Filtre Kahve',
    espresso: 'Espresso',
    'kapsul-kahve': 'Kapsül Kahve',
  }
  const displayTitle = HANDLE_TITLES[handle] || title

  return (
    <div>
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-amber-50 to-orange-50 dark:from-primary-900/20 dark:via-amber-900/10 dark:to-orange-900/10">
        <div className="container py-16 text-center lg:py-20">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wider text-primary-800 uppercase backdrop-blur-sm dark:bg-neutral-900/60 dark:text-primary-300">
            Pure Olentia Koleksiyon
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold text-neutral-900 sm:text-5xl dark:text-white">
            {displayTitle}
          </h1>
          {description && (
            <p className="mx-auto mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">{description}</p>
          )}
          {!description && (
            <p className="mx-auto mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">
              Pure Olentia kahve koleksiyonunu keşfedin. Taze kavrulmuş specialty kahveler.
            </p>
          )}
        </div>
      </div>

      <div className="container flex flex-col gap-y-20 py-12 sm:gap-y-20 lg:gap-y-28 lg:py-16">
        <div>
          <div className="mt-8 lg:mt-12">{children}</div>
        </div>

        <Divider />
        <SectionSliderLargeProduct products={relatedProducts} />
        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  )
}

export default Layout
