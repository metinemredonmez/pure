import AccordionInfo from '@/components/AccordionInfo'
import { Divider } from '@/components/Divider'
import LikeButton from '@/components/LikeButton'
import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions'
import ProductForm from '@/components/ProductForm/ProductForm'
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions'
import SectionPromo2 from '@/components/SectionPromo2'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import { getProductDetailByHandle, getProductReviews, getProducts } from '@/data/data'
import { getApiProductBySlug, getApiProducts, getApiProductReviews } from '@/lib/api'
import { adaptProduct } from '@/lib/adapters'
import Breadcrumb from '@/shared/Breadcrumb'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GalleryImages from '../GalleryImages'
import Policy from '../Policy'
import ProductReviews from '../ProductReviews'
import ProductStatus from '../ProductStatus'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductDetailByHandle(handle)
  const title = product?.title || 'Urun'
  const description = product?.description || 'Urun detay sayfasi'
  return {
    title,
    description,
  }
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  let product: any = null
  let relatedProducts: any[] = []
  let backendData: any = null

  try {
    const apiProduct = (await getApiProductBySlug(handle)) as any
    if (apiProduct?.data?.id) {
      backendData = apiProduct.data
      const adapted = adaptProduct(apiProduct.data, 0)
      product = {
        ...adapted,
        status: 'Stokta',
        breadcrumbs: [
          { id: 1, name: 'Ana Sayfa', href: '/' },
          { id: 2, name: apiProduct.data.category?.name || 'Kahveler', href: '/collections/all' },
        ],
        description: apiProduct.data.description || adapted.description,
        features: [
          apiProduct.data.origin ? `Mensei: ${apiProduct.data.origin}` : null,
          apiProduct.data.region ? `Bolge: ${apiProduct.data.region}` : null,
          apiProduct.data.process ? `Isleme: ${apiProduct.data.process}` : null,
          apiProduct.data.altitude ? `Rakim: ${apiProduct.data.altitude}` : null,
          apiProduct.data.flavorNotes ? `Tat Notalari: ${apiProduct.data.flavorNotes}` : null,
        ].filter(Boolean),
        careInstruction:
          'Serin ve kuru yerde, hava almayan kapta saklayin. Kavurma tarihinden itibaren 4 hafta icinde tuketin. Ogutulmus kahve 2 hafta icinde tuketilmelidir.',
        shippingAndReturn:
          '300 TL uzeri siparislerde ucretsiz kargo. Kapali urunlerde 14 gun iade hakki.',
      }
    }
    const apiRelated = (await getApiProducts({ limit: 6 })) as any
    const relData = apiRelated?.data?.data || apiRelated?.data || []
    if (Array.isArray(relData) && relData.length) {
      relatedProducts = relData.map((p: any, i: number) => adaptProduct(p, i))
    }
  } catch (e) {}

  if (!product) {
    product = await getProductDetailByHandle(handle)
  }
  if (!relatedProducts.length) {
    relatedProducts = (await getProducts()).slice(2, 8)
  }

  // Fetch reviews from backend first, fall back to static demo data
  let reviews: any[] = []
  try {
    const productId = backendData?.id
    if (productId) {
      const apiReviews = (await getApiProductReviews(productId)) as any
      const revData = apiReviews?.data?.data || apiReviews?.data || []
      if (Array.isArray(revData) && revData.length) {
        reviews = revData.map((r: any, i: number) => ({
          id: r.id || String(i),
          title: r.title || '',
          rating: r.rating || 5,
          content: r.content || r.comment || '',
          author: r.author?.name || r.user?.firstName || 'Müşteri',
          authorAvatar: undefined,
          date: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
            : '',
          datetime: r.createdAt || '',
        }))
      }
    }
  } catch {}

  if (!reviews.length) {
    reviews = await getProductReviews(handle)
  }

  if (!product.id) {
    return notFound()
  }

  const { title, status, featuredImage, rating, reviewNumber, options, price, selectedOptions, images, breadcrumbs } =
    product
  const sizeSelected = selectedOptions?.find((option: any) => option.name === 'Gramaj')?.value || ''
  const colorSelected = selectedOptions?.find((option: any) => option.name === 'Kavurma')?.value || ''

  // Aroma profile from backend
  const aromaProfile: string[] = Array.isArray(backendData?.aromaProfile) ? backendData.aromaProfile : []

  const renderRightSide = () => {
    return (
      <div className="w-full pt-10 lg:w-[45%] lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
        <div className="sticky top-8 flex flex-col gap-y-10">
          <div>
            <Breadcrumb breadcrumbs={breadcrumbs} currentPage={product.title} />
            <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">{title}</h1>
            {backendData?.shortDescription && (
              <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
                {backendData.shortDescription}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2.5 sm:gap-x-6">
              <Prices contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold" price={price || 0} />
              <div className="hidden h-7 border-l border-neutral-300 sm:block dark:border-neutral-700"></div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <a href="#reviews" className="flex items-center text-sm font-medium">
                  <StarIcon className="size-5 pb-px text-yellow-400" />
                  <div className="ms-1.5 flex">
                    <span>{rating}</span>
                    <span className="mx-2 block">·</span>
                    <span className="text-neutral-600 underline dark:text-neutral-400">
                      {reviewNumber} degerlendirme
                    </span>
                  </div>
                </a>
                <span>·</span>
                <ProductStatus status={status} />
              </div>
            </div>

            {/* Aroma profile badges */}
            {aromaProfile.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {aromaProfile.map((aroma, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800 dark:border-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                  >
                    {aroma}
                  </span>
                ))}
              </div>
            )}
          </div>

          <ProductForm product={product}>
            <fieldset className="flex flex-col gap-y-10">
              <div className="flex flex-col gap-y-8">
                <ProductColorOptions options={options} defaultColor={colorSelected} />
                <ProductSizeOptions options={options} defaultSize={sizeSelected} />
              </div>

              <div className="flex gap-x-3.5">
                <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
                  <NcInputNumber name="quantity" defaultValue={1} />
                </div>

                <ButtonPrimary className="flex-1" type="submit">
                  <HugeiconsIcon
                    icon={ShoppingBag03Icon}
                    size={20}
                    color="currentColor"
                    className="hidden sm:block"
                    strokeWidth={1.5}
                  />
                  <span className="text-base/6 font-normal sm:ml-2.5">Sepete Ekle</span>
                </ButtonPrimary>
              </div>
            </fieldset>
          </ProductForm>

          <Divider />

          <AccordionInfo />

          <div className="hidden xl:block">
            <Policy />
          </div>
        </div>
      </div>
    )
  }

  const renderDetailSection = () => {
    const description = backendData?.description || product.description
    const hasAnyDetails =
      backendData?.origin ||
      backendData?.region ||
      backendData?.altitude ||
      backendData?.process ||
      backendData?.roastLevel ||
      backendData?.flavorNotes ||
      description

    if (!hasAnyDetails) return null

    return (
      <div className="">
        <h2 className="text-2xl font-semibold">Ürün Detayları</h2>
        <div className="prose prose-sm mt-7 sm:prose sm:max-w-4xl dark:prose-invert">
          {description && <p>{description}</p>}

          {/* Coffee specific info grid */}
          <div className="not-prose mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {backendData?.origin && (
              <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Menşei</div>
                <div className="mt-1 text-base font-medium">{backendData.origin}</div>
              </div>
            )}
            {backendData?.region && (
              <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Bölge</div>
                <div className="mt-1 text-base font-medium">{backendData.region}</div>
              </div>
            )}
            {backendData?.altitude && (
              <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Rakım</div>
                <div className="mt-1 text-base font-medium">{backendData.altitude}</div>
              </div>
            )}
            {backendData?.process && (
              <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">İşleme Yöntemi</div>
                <div className="mt-1 text-base font-medium">{backendData.process}</div>
              </div>
            )}
            {backendData?.roastLevel && (
              <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Kavurma</div>
                <div className="mt-1 text-base font-medium">
                  {backendData.roastLevel === 'LIGHT'
                    ? 'Açık Kavurma'
                    : backendData.roastLevel === 'MEDIUM'
                      ? 'Orta Kavurma'
                      : backendData.roastLevel === 'DARK'
                        ? 'Koyu Kavurma'
                        : backendData.roastLevel}
                </div>
              </div>
            )}
            {backendData?.flavorNotes && (
              <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Tat Notaları</div>
                <div className="mt-1 text-base font-medium">{backendData.flavorNotes}</div>
              </div>
            )}
          </div>

          {/* Brewing guide */}
          <div className="not-prose mt-8 rounded-2xl bg-primary-50 p-6 dark:bg-primary-900/20">
            <h3 className="text-lg font-semibold">Önerilen Demleme</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              <li>• <strong>Oran:</strong> 1:16 (1g kahve / 16ml su)</li>
              <li>• <strong>Su Sıcaklığı:</strong> 92-96 °C</li>
              <li>• <strong>Öğütme:</strong> Orta-ince (filtre için)</li>
              <li>• <strong>Süre:</strong> 3-4 dakika</li>
            </ul>
          </div>

          {/* Storage */}
          <div className="not-prose mt-6 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
            <h3 className="text-lg font-semibold">Saklama Koşulları</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Serin ve kuru bir yerde, hava almayan kapta saklayınız. Kavurma tarihinden itibaren 4 hafta içinde
              tüketilmesi tazelik açısından önemlidir. Öğütülmüş kahvenin 2 hafta içinde tüketilmesi önerilir.
              Buzdolabında saklamayınız.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderLeftSide = () => {
    const galleryImages = [featuredImage, ...(images || [])].map((item) => item?.src).filter(Boolean) as string[]

    return (
      <div className="w-full lg:w-[55%]">
        <div className="relative">
          <GalleryImages images={galleryImages} gridType="grid5" />
          <LikeButton className="absolute top-3 left-3" />
        </div>
      </div>
    )
  }

  return (
    <main className="container mt-5 lg:mt-11">
      <div className="lg:flex">
        {renderLeftSide()}
        {renderRightSide()}
      </div>

      <div className="mt-12 flex flex-col gap-y-10 sm:mt-16 sm:gap-y-16">
        <div className="block xl:hidden">
          <Policy />
        </div>
        {renderDetailSection()}
        <Divider />
        <ProductReviews reviewNumber={reviewNumber || 0} rating={rating || 1} reviews={reviews} />
        <Divider />
        <SectionSliderProductCard
          heading="Benzer Ürünler"
          subHeading="Bunları da beğenebilirsiniz"
          data={relatedProducts}
        />
        <Divider />
        <SectionPromo2 />
      </div>
    </main>
  )
}
