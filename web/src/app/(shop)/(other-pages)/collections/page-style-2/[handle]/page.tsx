import { FiltersMenuSidebar } from '@/components/FiltersMenu'
import ProductCard from '@/components/ProductCard'
import { getProducts } from '@/data/data'
import { getApiProducts } from '@/lib/api'
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

  let products: any[] = []
  try {
    const apiRes = await getApiProducts({ category: handle, limit: 20 }) as any
    const prodData = apiRes?.data?.data || apiRes?.data || []
    if (Array.isArray(prodData) && prodData.length) {
      products = prodData.map((p: any, i: number) => adaptProduct(p, i))
    }
  } catch (e) {}
  if (!products.length) {
    products = await getProducts()
  }

  return (
    <main>
      <div className="flex flex-col lg:flex-row">
        <div className="pr-4 lg:w-1/3 xl:w-1/4">
          <FiltersMenuSidebar />
        </div>

        <div className="mb-10 shrink-0 lg:mx-8 lg:mb-0"></div>

        <div className="flex-1">
          <div className="grid flex-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((item) => (
              <ProductCard data={item} key={item.id} />
            ))}
          </div>

          <div className="mt-20 flex justify-start lg:mt-24">
            <Pagination className="">
              <PaginationPrevious href="?page=1" />
              <PaginationList>
                <PaginationPage href="?page=1" current>
                  1
                </PaginationPage>
                <PaginationPage href="?page=2">2</PaginationPage>
              </PaginationList>
              <PaginationNext href="?page=2" />
            </Pagination>
          </div>
        </div>
      </div>
    </main>
  )
}
