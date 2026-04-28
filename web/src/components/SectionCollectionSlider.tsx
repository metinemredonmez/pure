'use client'

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
  headingDim = 'Sizin için seçilmiş koleksiyonlar',
  heading = 'Daha fazla keşfet',
  cardCtaLabel = 'Hepsini Gör',
  emblaOptions = {
    slidesToScroll: 'auto',
  },
}: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)

  return (
    <div className={className}>
      <Heading
        className="container mb-12 text-center text-neutral-900 lg:mb-14 dark:text-neutral-50"
        headingDim={headingDim}
        isCenter
        hasNextPrev
        prevBtnDisabled={prevBtnDisabled}
        nextBtnDisabled={nextBtnDisabled}
        onClickPrev={onPrevButtonClick}
        onClickNext={onNextButtonClick}
      >
        {heading}
      </Heading>

      <div className="embla pl-container" ref={emblaRef}>
        <div className="-ms-5 embla__container">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="max-w-2xl embla__slide basis-11/12 ps-5 sm:basis-2/3 lg:basis-3/7 xl:basis-2/5 2xl:basis-[34%]"
            >
              <CollectionCard3 collection={collection} ctaLabel={cardCtaLabel} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SectionCollectionSlider
