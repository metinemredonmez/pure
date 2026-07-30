'use client'

import Heading from '@/components/Heading/Heading'
import { useTranslation } from '@/contexts/LanguageContext'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import { useCarouselDotButton } from '@/hooks/use-carousel-dot-buttons'
import { StarIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import type { EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { FC } from 'react'

export const DEMO_DATA = [
  {
    id: 1,
    clientName: 'Ahmet Yılmaz',
    content:
      'Kahve kalitesi muhteşem. Taze kavrulmuş olarak geldiğini her yudumda hissediyorsunuz. Artık sadece Pure Olentia tercih ediyorum.',
    color: 'bg-amber-500',
  },
  {
    id: 2,
    clientName: 'Zeynep Kara',
    content:
      'Abonelik sistemi çok pratik. Her ay farklı bir menşei deniyorum. Kahve keşif yolculuğum burada başladı.',
    color: 'bg-rose-500',
  },
  {
    id: 3,
    clientName: 'Mert Bozkurt',
    content:
      'İzlenebilirlik özelliği harika. Kahvemin hangi çiftlikten geldiğini, nasıl işlendiğini bilmek güven veriyor.',
    color: 'bg-emerald-600',
  },
  {
    id: 4,
    clientName: 'Selin Demir',
    content:
      'Ofisimiz için toplu sipariş veriyoruz. Kalite tutarlı, teslimat hızlı. Çalışanlarımız kahvenin farkını hemen fark etti.',
    color: 'bg-indigo-500',
  },
]

const getInitials = (name: string) => {
  const parts = name.split(' ').filter(Boolean)
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
}

export interface SectionClientSayProps {
  className?: string
  emblaOptions?: EmblaOptionsType
  heading?: string
  subHeading?: string
}

const SectionClientSay: FC<SectionClientSayProps> = ({
  className,
  emblaOptions = {
    slidesToScroll: 1,
    loop: true,
  },
  heading,
  subHeading,
}) => {
  const { t } = useTranslation()
  const headingText = heading ?? t('reviews.client_say_heading', 'Müşterilerimiz ne diyor?')
  const subHeadingText = subHeading ?? t('reviews.client_say_subheading', 'Pure Olentia ailesinden geri bildirimler')
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, [Autoplay({ playOnInit: true, delay: 4500 })])
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useCarouselDotButton(emblaApi)

  return (
    <div className={clsx('relative', className)}>
      <Heading
        description={subHeadingText}
        isCenter
        prevBtnDisabled={prevBtnDisabled}
        nextBtnDisabled={nextBtnDisabled}
        onClickPrev={onPrevButtonClick}
        onClickNext={onNextButtonClick}
      >
        {headingText}
      </Heading>

      <div className="relative mx-auto mt-12 max-w-3xl">
        <div className="embla" ref={emblaRef}>
          <ul className="embla__container">
            {DEMO_DATA.map((item) => (
              <li
                key={item.id}
                className="embla__slide flex basis-full flex-col items-center px-4 text-center sm:px-8"
              >
                {/* Google-style initial avatar */}
                <div
                  className={clsx(
                    'flex size-16 items-center justify-center rounded-full text-xl font-semibold text-white',
                    item.color
                  )}
                >
                  {getInitials(item.clientName)}
                </div>

                {/* Rating */}
                <div className="mt-4 flex items-center gap-0.5 text-amber-500">
                  <StarIcon className="size-5" />
                  <StarIcon className="size-5" />
                  <StarIcon className="size-5" />
                  <StarIcon className="size-5" />
                  <StarIcon className="size-5" />
                </div>

                {/* Content */}
                <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
                  “{item.content}”
                </p>

                {/* Name */}
                <p className="mt-5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.clientName}
                </p>
                <p className="text-xs text-neutral-500">{t('reviews.customer_label', 'Pure Olentia Müşterisi')}</p>
              </li>
            ))}
          </ul>

          <div className="embla__dots mt-10 flex items-center justify-center gap-1.5">
            {scrollSnaps.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => onDotButtonClick(index)}
                aria-label={t('reviews.review_n', 'Yorum {n}', { n: index + 1 })}
                className={clsx(
                  index === selectedIndex ? 'w-6 bg-primary-700' : 'w-2 bg-neutral-300 dark:bg-neutral-700',
                  'h-2 rounded-full transition-all'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionClientSay
