'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import { TProductItem } from '@/data/data'
import NcImage from '@/shared/NcImage/NcImage'
import { Link } from '@/shared/link'
import { ArrowsPointingOutIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { FC } from 'react'
import AddToCardButton from './AddToCardButton'
import LikeButton from './LikeButton'
import Prices from './Prices'
import ProductStatus from './ProductStatus'
import { useAside } from './aside'

interface Props {
  className?: string
  data: TProductItem
  isLiked?: boolean
}

const ProductCard: FC<Props> = ({ className = '', data, isLiked }) => {
  const { t } = useTranslation()
  const { title, price, status, rating, options, handle, selectedOptions, reviewNumber, images, featuredImage } = data
  const color = selectedOptions?.find((option) => option.name === 'Kavurma')?.value

  // Varyant fiyatlarından "başlangıç fiyatı" (gramajı olan ürünlerde ₺X'ten başlayan)
  const variantPrices = (((data as any).variants || []) as any[])
    .map((v) => parseFloat(v?.price))
    .filter((n) => Number.isFinite(n) && n > 0)
  const minPrice = variantPrices.length ? Math.min(...variantPrices) : price ?? 0
  const hasPriceRange = variantPrices.length > 1 && Math.min(...variantPrices) !== Math.max(...variantPrices)
  // Kavurma / menşei mini bilgisi
  const roastLevel = (data as any).roastLevel
  const roastLabel =
    roastLevel === 'LIGHT' ? t('product.roast_light', 'Açık Kavurma') :
    roastLevel === 'DARK' ? t('product.roast_dark', 'Koyu Kavurma') :
    roastLevel === 'MEDIUM' ? t('product.roast_medium', 'Orta Kavurma') : ''
  const origin = (data as any).origin as string | undefined

  const { open: openAside, setProductQuickViewHandle } = useAside()

  const renderColorOptions = () => {
    const optionColorValues = options?.find((option) => option.name === 'Kavurma')?.optionValues

    if (!optionColorValues?.length) {
      return null
    }

    return (
      <div className="flex gap-2">
        {optionColorValues.map((color) => (
          <div key={color.name} className="relative size-4 cursor-pointer overflow-hidden rounded-full">
            <div
              className="absolute inset-0 z-0 rounded-full bg-cover ring-1 ring-neutral-900/20 dark:ring-white/20"
              style={{
                backgroundColor: color.swatch?.color,
                backgroundImage: color.swatch?.image ? `url(${color.swatch.image})` : undefined,
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  const renderGroupButtons = () => {
    return (
      <div className="invisible absolute inset-x-1 bottom-0 flex justify-center gap-1.5 opacity-0 transition-all group-hover:visible group-hover:bottom-4 group-hover:opacity-100">
        <AddToCardButton
          as={'button'}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs/normal text-white shadow-lg hover:bg-neutral-800"
          title={title || ''}
          imageUrl={featuredImage?.src || ''}
          price={price || 0}
          quantity={1}
          size={selectedOptions?.find((option) => option.name === 'Gramaj')?.value}
          color={selectedOptions?.find((option) => option.name === 'Kavurma')?.value}
        >
          <ShoppingBagIcon className="-ml-1 size-3.5" />
          <span>{t('common.add_to_cart', 'Sepete Ekle')}</span>
        </AddToCardButton>

        <button
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs/normal text-neutral-950 shadow-lg hover:bg-neutral-50"
          type="button"
          onClick={() => {
            setProductQuickViewHandle(handle || '')
            openAside('product-quick-view')
          }}
        >
          <ArrowsPointingOutIcon className="-ml-1 size-3.5" />
          <span>{t('product.quick_view', 'Hızlı bakış')}</span>
        </button>
      </div>
    )
  }

  return (
    <>
      <div className={`product-card group/card relative flex flex-col bg-transparent transition-all duration-300 hover:-translate-y-1 ${className}`}>
        <Link href={'/products/' + handle} className="absolute inset-0"></Link>

        <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 shadow-sm transition-shadow duration-300 group-hover/card:shadow-2xl dark:bg-neutral-300">
          <Link href={'/products/' + handle} className="block">
            {featuredImage?.src && (
              <NcImage
                containerClassName="flex aspect-w-11 aspect-h-12 w-full h-0"
                src={featuredImage}
                className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
                alt={handle}
              />
            )}
          </Link>
          <ProductStatus status={status} />
          <LikeButton liked={isLiked} productId={data.id} className="absolute end-3 top-3 z-10" />
          {renderGroupButtons()}
        </div>

        <div className="space-y-4 px-2.5 pt-5 pb-2.5">
          <div>
            <h2 className="nc-ProductCard__title text-base font-semibold transition-colors group-hover/card:text-primary-700 dark:group-hover/card:text-primary-400">{title}</h2>
            {(roastLabel || origin) && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {[roastLabel, origin].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <Prices
                contentClass="text-lg"
                price={hasPriceRange ? minPrice : price ?? 1}
                // İndirim ürün fiyatına göre tanımlı — gösterilen fiyat ürün fiyatıysa üstü çizili eski fiyat çıkar
                compareAtPrice={(hasPriceRange ? minPrice : price) === price ? (data as any).compareAtPrice : null}
              />
              {hasPriceRange && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('product.starting_from', '’ten başlayan')}</span>
              )}
            </div>
            {(reviewNumber ?? 0) > 0 && (
              <div className="mb-0.5 flex items-center">
                <StarIcon className="h-5 w-5 pb-px text-amber-400" />
                <span className="ms-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {rating} ({t('product.reviews_count', '{count} değerlendirme', { count: reviewNumber ?? 0 })})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductCard
