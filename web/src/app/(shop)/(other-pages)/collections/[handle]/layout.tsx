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

  return (
    <div className="container flex flex-col gap-y-20 py-20 sm:gap-y-20 lg:gap-y-28 lg:py-28">
      <div>
        <div className="max-w-3xl text-left">
          <h1 className="mt-2 block text-4xl font-semibold tracking-tight sm:text-[2.5rem]">{title}</h1>
          {description && (
            <p className="mt-6 block text-base text-neutral-500 dark:text-neutral-400">{description}</p>
          )}
        </div>
        <div className="mt-16 lg:mt-24">{children}</div>
      </div>

      <Divider />
      <SectionSliderLargeProduct products={relatedProducts} />
      <Divider />
      <SectionPromo1 />
    </div>
  )
}

export default Layout
