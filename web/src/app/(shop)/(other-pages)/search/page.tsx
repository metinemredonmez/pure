import ProductCard from '@/components/ProductCard'
import { getApiProducts } from '@/lib/api'
import { adaptProduct } from '@/lib/adapters'
import ButtonCircle from '@/shared/Button/ButtonCircle'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import Form from 'next/form'

export const metadata: Metadata = {
  title: 'Arama',
  description: 'Kahve ve ekipman ara',
  robots: { index: false },
}

// Gerçek ürün araması (backend: ad / açıklama / SKU). Önceden template sayfasıydı:
// yazılan kelime yok sayılıyor, sahte filtre ve sayfalama gösteriliyordu.
const PageSearch = async ({ searchParams }: { searchParams: Promise<{ q?: string }> }) => {
  const query = ((await searchParams).q || '').trim()

  const apiRes = (await getApiProducts({ limit: 48, search: query || undefined })) as any
  const prodData = apiRes?.data?.data || apiRes?.data || []
  const products = Array.isArray(prodData) ? prodData.map((p: any, i: number) => adaptProduct(p, i)) : []

  return (
    <div>
      <div className={'h-24 w-full bg-primary-50 2xl:h-28 dark:bg-white/10'} />
      <div className="container">
        <header className="mx-auto -mt-10 flex max-w-2xl flex-col lg:-mt-7">
          <Form action="/search" className="relative w-full">
            <fieldset className="text-neutral-500 dark:text-neutral-300">
              <label htmlFor="search-input" className="sr-only">
                Ürün ara
              </label>
              <HugeiconsIcon
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-2xl sm:left-5"
                icon={Search01Icon}
                size={24}
              />
              <input
                className="block w-full rounded-full border bg-white py-4 pr-5 pl-12 placeholder:text-zinc-500 focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 sm:py-5 sm:text-sm md:pl-15 dark:bg-neutral-800 dark:placeholder:text-zinc-400 dark:focus:ring-primary-600/25"
                id="search-input"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Kahve, öğütme, paket… arayın"
              />
              <ButtonCircle
                className="absolute top-1/2 right-2 -translate-y-1/2 sm:right-2.5"
                size="size-11"
                type="submit"
                aria-label="Ara"
              >
                <ArrowRightIcon className="size-5 text-white" />
              </ButtonCircle>
            </fieldset>
          </Form>
        </header>
      </div>

      <div className="container py-16 lg:pt-20 lg:pb-28">
        <main>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {query ? (
              <>
                <span className="font-semibold text-neutral-900 dark:text-white">&ldquo;{query}&rdquo;</span> için{' '}
                {products.length} ürün bulundu
              </>
            ) : (
              <>{products.length} ürün</>
            )}
          </p>

          {products.length > 0 ? (
            <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((item) => (
                <ProductCard data={item} key={item.id} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-neutral-500 dark:text-neutral-400">
              Aramanızla eşleşen ürün bulunamadı. Farklı bir kelime deneyin.
            </p>
          )}
        </main>
      </div>
    </div>
  )
}

export default PageSearch
