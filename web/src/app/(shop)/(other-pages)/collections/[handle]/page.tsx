import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
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

  // Read sort + search params from URL (Kavurma/Gramaj/Fiyat filtreleri kaldırıldı)
  if (filters.sortBy) apiQuery.sortBy = String(filters.sortBy)
  if (filters.sortOrder) apiQuery.sortOrder = String(filters.sortOrder)
  if (filters.search) apiQuery.search = String(filters.search)

  // Kategori listesi — admin'deki gerçek kategoriler (uyumlu olması için)
  let categories: { slug: string; name: string }[] = []
  try {
    const catRes = (await getApiCategories()) as any
    const cats = catRes?.data || []
    if (Array.isArray(cats)) {
      categories = cats
        .filter((c: any) => c?.slug && c?.name)
        .map((c: any) => ({ slug: c.slug, name: c.name }))
    }
  } catch (e) {}

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
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-2.5 border-b border-neutral-100 bg-white/85 py-3 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/85">
        {/* Kategoriler — admin'deki gerçek kategoriler, aktif olan ince alt-çizgiyle */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {[{ slug: 'all', name: 'Tümü' }, ...categories].map((c) => {
            const active = handle === c.slug
            const href = c.slug === 'all' ? '/collections/all' : `/collections/${c.slug}`
            return (
              <a
                key={c.slug}
                href={href}
                className={`relative pb-1.5 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:transition-all ${
                  active
                    ? 'text-primary-700 after:bg-primary-700 dark:text-primary-400 dark:after:bg-primary-400'
                    : 'text-neutral-500 after:bg-transparent hover:text-neutral-900 hover:after:bg-neutral-300 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {c.name}
              </a>
            )
          })}
        </nav>
        <FilterSortByMenuListBox className="ml-auto" />
      </div>

      {products.length > 0 && (
        <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{products.length}</span> ürün listeleniyor
        </p>
      )}

      {products.length > 0 ? (
        <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((produc, i) => (
            <div
              key={produc.id}
              className="nc-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 10) * 55}ms` }}
            >
              <ProductCard data={produc} />
            </div>
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
