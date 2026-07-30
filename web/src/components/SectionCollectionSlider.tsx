'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import { TCollection } from '@/data/data'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import CollectionCard3 from './CollectionCard3'
import Heading from './Heading/Heading'

interface Props {
  className?: string
  emblaOptions?: EmblaOptionsType
  collections: TCollection[]
  headingDim?: string
  heading?: string
  cardCtaLabel?: string
}

const SectionCollectionSlider = ({
  className,
  collections,
  headingDim,
  heading,
  cardCtaLabel,
  emblaOptions = {
    slidesToScroll: 'auto',
  },
}: Props) => {
  const { t } = useTranslation()
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)

  const _headingDim = headingDim ?? t('section.selected_collections', 'Sizin için seçilmiş koleksiyonlar')
  const _heading = heading ?? t('section.explore_more', 'Daha fazla keşfet')
  const _cardCtaLabel = cardCtaLabel ?? t('common.view_all', 'Hepsini Gör')

  return (
    <div className={className}>
      <Heading
        className="container mb-12 text-center text-neutral-900 lg:mb-14 dark:text-neutral-50"
        headingDim={_headingDim}
        isCenter
        hasNextPrev
        prevBtnDisabled={prevBtnDisabled}
        nextBtnDisabled={nextBtnDisabled}
        onClickPrev={onPrevButtonClick}
        onClickNext={onNextButtonClick}
      >
        {_heading}
      </Heading>

      <div className="embla pl-container pr-container" ref={emblaRef}>
        <div className="-ms-5 embla__container">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="max-w-2xl embla__slide basis-11/12 ps-5 sm:basis-2/3 lg:basis-1/3"
            >
              <CollectionCard3
                collection={collection}
                ctaLabel={_cardCtaLabel}
                href={(collection as any).cardHref}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SectionCollectionSlider
