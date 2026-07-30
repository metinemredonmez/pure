'use client'

import Heading from '@/components/Heading/Heading'
import { useTranslation } from '@/contexts/LanguageContext'
import { TProductItem } from '@/data/data'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import Link from 'next/link'
import { FC } from 'react'
import ProductCardLarge from './ProductCardLarge'

export interface SectionSliderLargeProductProps {
  className?: string
  itemClassName?: string
  products: TProductItem[]
  heading?: string
  headingDim?: string
  viewAllLabel?: string
  viewAllCaption?: string
  emblaOptions?: EmblaOptionsType
}

const SectionSliderLargeProduct: FC<SectionSliderLargeProductProps> = ({
  className = '',
  products,
  heading,
  headingDim,
  viewAllLabel,
  viewAllCaption,
  emblaOptions = {
    slidesToScroll: 'auto',
  },
}) => {
  const { t } = useTranslation()
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)

  const _heading = heading ?? t('section.experts_choice', 'Uzmanlar seçti')
  const _headingDim = headingDim ?? t('section.weekly_favorites', 'Haftanın favorileri')
  const _viewAllLabel = viewAllLabel ?? t('section.view_all_label', 'Daha fazla')
  const _viewAllCaption = viewAllCaption ?? t('section.view_all_caption', 'Tümünü gör')
  return (
    <div className={`nc-SectionSliderLargeProduct ${className}`}>
      <Heading
        isCenter={false}
        hasNextPrev
        headingDim={_headingDim}
        prevBtnDisabled={prevBtnDisabled}
        nextBtnDisabled={nextBtnDisabled}
        onClickPrev={onPrevButtonClick}
        onClickNext={onNextButtonClick}
      >
        {_heading}
      </Heading>

      <div className={'embla'} ref={emblaRef}>
        <div className="-ms-5 embla__container sm:-ms-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="embla__slide basis-4/5 ps-4 sm:basis-1/2 sm:ps-6 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCardLarge product={product} />
            </div>
          ))}

          <Link
            href={'/collections/all'}
            className="group relative block embla__slide basis-4/5 ps-4 sm:basis-1/2 sm:ps-6 lg:basis-1/3 xl:basis-1/4"
          >
            <div className="relative h-[300px] overflow-hidden rounded-2xl">
              <div className="h-[300px] bg-black/5 dark:bg-neutral-800"></div>
              <div className="absolute inset-x-10 inset-y-6 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <span className="text-xl font-semibold">{_viewAllLabel}</span>
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={24}
                    color="currentColor"
                    className="absolute left-full ms-2 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="mt-1 text-sm">{_viewAllCaption}</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SectionSliderLargeProduct
