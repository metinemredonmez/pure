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

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  // 1. Try to fetch category filtered products from backend
  let products: any[] = []
  let categoryFoundInBackend = false

  try {
    // Check if this category exists in backend
    const apiCats = (await getApiCategories()) as any
    const cats = apiCats?.data || []
    const backendCategory = cats.find((c: any) => c.slug === handle)

    if (backendCategory) {
      categoryFoundInBackend = true
      // Fetch products for this specific category
      const apiRes = (await getApiProducts({ category: handle, limit: 20 })) as any
      const prodData = apiRes?.data?.data || apiRes?.data || []
      if (Array.isArray(prodData) && prodData.length) {
        products = prodData.map((p: any, i: number) => adaptProduct(p, i))
      }
    } else {
      // Not a backend category - maybe it's a collection or "all"
      const apiRes = (await getApiProducts({ limit: 20 })) as any
      const prodData = apiRes?.data?.data || apiRes?.data || []
      if (Array.isArray(prodData) && prodData.length) {
        products = prodData.map((p: any, i: number) => adaptProduct(p, i))
      }
    }
  } catch (e) {}

  // 2. Only fallback to static data if category NOT found in backend
  if (!products.length && !categoryFoundInBackend) {
    products = await getProducts()
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
          <h3 className="mt-6 text-xl font-semibold">Bu kategoride henuz urun yok</h3>
          <p className="mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            Cok yakinda bu kategoriye yeni urunler eklenecektir. Diger kategorilerimizi kesfetmek ister misiniz?
          </p>
          <a
            href="/collections/all"
            className="mt-6 rounded-full bg-primary-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-800"
          >
            Tum Kahveleri Gor
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
