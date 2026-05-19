import { Divider } from '@/components/Divider'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { FiltersMenuTabs } from '@/components/FiltersMenu'
import ProductCard from '@/components/ProductCard'
import { getProducts } from '@/data/data'
import { getApiProducts, getApiCategories } from '@/lib/api'
import { adaptProduct } from '@/lib/adapters'
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { handle } = await params
  const filters = await searchParams

  // Build API query from URL search params + handle
  const apiQuery: Record<string, any> = { limit: 40 }

  // Handle = category slug (e.g. 'turk-kahvesi', 'filtre-kahve', 'all')
  if (handle && handle !== 'all') {
    apiQuery.category = handle
  }

  // Read filter params from URL
  if (filters.roastLevel) apiQuery.roastLevel = String(filters.roastLevel)
  if (filters.weight) apiQuery.weight = String(filters.weight)
  if (filters.minPrice) apiQuery.minPrice = String(filters.minPrice)
  if (filters.maxPrice) apiQuery.maxPrice = String(filters.maxPrice)
  if (filters.sortBy) apiQuery.sortBy = String(filters.sortBy)
  if (filters.sortOrder) apiQuery.sortOrder = String(filters.sortOrder)
  if (filters.search) apiQuery.search = String(filters.search)

  let products: any[] = []
  // "all" handle dışında ise specific kategori sayfası → boş kategori için
  // BAŞKA kategoriyi gösterme. Türk Kahvesi olan ürünler Espresso sayfasına
  // sızmasın.
  const isSpecificCategory = !!apiQuery.category

  try {
    // Fetch with filters
    const apiRes = (await getApiProducts(apiQuery)) as any
    const prodData = apiRes?.data?.data || apiRes?.data || []
    if (Array.isArray(prodData) && prodData.length) {
      products = prodData.map((p: any, i: number) => adaptProduct(p, i))
    }
  } catch (e) {}

  // Sadece "all" sayfası boş gelirse data.ts'ten demo göster (geçici).
  // Specific kategori sayfası (espresso, filtre-kahve, vs.) boşsa BOŞ hâl
  // göstersin — yanlış ürün karıştırmasın.
  if (!products.length && !isSpecificCategory) {
    try {
      products = await getProducts()
    } catch {}
  }

  return (
    <main>
      <div className="flex flex-wrap items-center gap-2.5">
        <FiltersMenuTabs />
        <FilterSortByMenuListBox className="ml-auto" />
      </div>

      <Divider className="mt-8" />

      {products.length > 0 ? (
        <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((produc) => (
            <ProductCard data={produc} key={produc.id} />
          ))}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <svg
              className="h-10 w-10 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-semibold">Bu kategoride henüz ürün yok</h3>
          <p className="mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            Çok yakında bu kategoriye yeni ürünler eklenecektir. Diğer kategorilerimizi keşfetmek ister misiniz?
          </p>
          <a
            href="/collections/all"
            className="mt-6 rounded-full bg-primary-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-800"
          >
            Tüm Kahveleri Gör
          </a>
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-20 flex justify-center lg:mt-24">
          <Pagination className="mx-auto">
            <PaginationPrevious href="?page=1" />
            <PaginationList>
              <PaginationPage href="?page=1" current>
                1
              </PaginationPage>
            </PaginationList>
            <PaginationNext href="?page=1" />
          </Pagination>
        </div>
      )}
    </main>
  )
}
