import { TProductItem } from '@/data/data'
import NcImage from '@/shared/NcImage/NcImage'
import { Link } from '@/shared/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { FC } from 'react'
import Prices from './Prices'

export interface Props {
  className?: string
  product: TProductItem
}

const ProductCardLarge: FC<Props> = ({ className, product }) => {
  const { images, title, price, rating, reviewNumber, handle, selectedOptions } = product

  const color = selectedOptions?.find((option) => option.name === 'Kavurma')?.value

  return (
    <div className={`CollectionCard2 group relative ${className}`}>
      <div className="relative flex flex-col">
        {images?.[0] && (
          <NcImage
            containerClassName="aspect-[4/3] bg-neutral-100 rounded-xl overflow-hidden relative"
            className="rounded-xl object-cover"
            fill
            src={images?.[0]}
            alt=""
            sizes="(max-width: 640px) 100vw, 360px"
          />
        )}
        <div className="mt-2 grid grid-cols-3 gap-x-1.5 sm:gap-x-2">
          {images?.[1] && (
            <NcImage
              containerClassName="w-full h-14 sm:h-16 rounded-lg overflow-hidden relative"
              className="rounded-lg object-cover"
              src={images[1]}
              alt={images[1].alt}
              fill
              sizes="120px"
            />
          )}
          {images?.[2] && (
            <NcImage
              containerClassName="w-full h-14 sm:h-16 rounded-lg overflow-hidden relative"
              className="rounded-lg object-cover"
              src={images[2]}
              alt={images[2].alt}
              sizes="120px"
              fill
            />
          )}
          {images?.[3] && (
            <NcImage
              containerClassName="w-full h-14 sm:h-16 rounded-lg overflow-hidden relative"
              className="rounded-lg object-cover"
              src={images[3]}
              alt={images[3].alt}
              fill
              sizes="120px"
            />
          )}
        </div>
      </div>

      <div className="relative mt-5 flex justify-between gap-4">
        {/* TITLE */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-1 text-neutral-500 dark:text-neutral-400">
            <span className="text-sm">
              <span className="line-clamp-1">{color}</span>
            </span>
            <span className="h-5 border-l border-neutral-200 sm:mx-2 dark:border-neutral-700"></span>
            <StarIcon className="h-4 w-4 text-orange-400" />
            <span className="text-sm">
              <span className="line-clamp-1">
                {rating} ({reviewNumber} değerlendirme)
              </span>
            </span>
          </div>
        </div>
        <Prices className="mt-0.5" price={price || 1} />
      </div>
      <Link href={'/products/' + handle} className="absolute inset-0"></Link>
    </div>
  )
}

export default ProductCardLarge
