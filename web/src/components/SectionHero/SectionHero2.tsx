'use client'

import backgroundLineSvg from '@/images/Moon.svg'
import heroImage1 from '@/images/hero-right-1.png'
import heroImage2 from '@/images/hero-right-2.png'
import heroImage3 from '@/images/hero-right-3.png'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { useInterval } from 'react-use'

export interface HeroSlide {
  id: number | string
  imageUrl: string
  heading: string
  subHeading: string
  btnText: string
  btnHref: string
}

// Default fallback data (used when no slides prop passed)
const defaultData: HeroSlide[] = [
  {
    id: 1,
    imageUrl: heroImage1.src,
    heading: 'Premium Specialty <br /> Kahve Koleksiyonu',
    subHeading: 'Taze kavrulmuş, tek menşeili kahveler',
    btnText: 'Kahveleri Keşfet',
    btnHref: '/collections/all',
  },
  {
    id: 2,
    imageUrl: heroImage2.src,
    heading: 'Tarladan Fincana <br /> İzlenebilir Lezzet',
    subHeading: 'Her çekirdeğin hikayesini takip edin',
    btnText: 'Hikayemizi Öğrenin',
    btnHref: '/about',
  },
  {
    id: 3,
    imageUrl: heroImage3.src,
    heading: 'Aylık Kahve <br /> Aboneliği',
    subHeading: 'Her ay kapınıza taze kahve',
    btnText: 'Abonelik Başlat',
    btnHref: '/subscription',
  },
]

interface Props {
  className?: string
  slides?: HeroSlide[]
}

let TIME_OUT: NodeJS.Timeout | null = null
const SectionHero2: FC<Props> = ({ className = '', slides }) => {
  // =================
  const data: HeroSlide[] = slides && slides.length ? slides : defaultData

  const [isSlided, setIsSlided] = useState(false)
  const [indexActive, setIndexActive] = useState(0)
  const [isRunning, toggleIsRunning] = useState(true)

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      handleClickNext()
    },
    onSwipedRight: () => {
      handleClickPrev()
    },
    trackMouse: true,
  })

  useEffect(() => {
    if (isSlided || !indexActive) {
      return
    }
    setIsSlided(true)
  }, [indexActive, isSlided])

  useInterval(
    () => {
      handleAutoNext()
    },
    isRunning ? 8000 : 999999
  )

  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= data.length - 1) {
        return 0
      }
      return state + 1
    })
  }

  const handleClickNext = () => {
    setIndexActive((state) => {
      if (state >= data.length - 1) {
        return 0
      }
      return state + 1
    })
    handleAfterClick()
  }

  const handleClickPrev = () => {
    setIndexActive((state) => {
      if (state === 0) {
        return data.length - 1
      }
      return state - 1
    })
    handleAfterClick()
  }

  const handleAfterClick = () => {
    toggleIsRunning(false)
    if (TIME_OUT) {
      clearTimeout(TIME_OUT)
    }
    TIME_OUT = setTimeout(() => {
      toggleIsRunning(true)
    }, 1000)
  }

  // =================================================== render

  const renderItem = (index: number) => {
    const isActive = indexActive === index
    const item = data[index]

    return (
      <div
        className={clsx(
          'fade--animation relative grid items-center gap-5 overflow-hidden bg-[#F5EDE4] px-6 py-6 sm:gap-8 sm:px-8 sm:py-8 lg:grid-cols-2 lg:px-12',
          isActive ? 'grid' : 'hidden'
        )}
        key={index}
      >
        {/* SOL: kompakt metin */}
        <div className="relative flex max-w-md flex-col items-start fade--animation__left">
          <span className="block text-[11px] font-medium uppercase tracking-widest text-neutral-500 fade--animation__subheading sm:text-xs">
            {item.subHeading}
          </span>
          <h2
            className="mt-2 text-xl font-bold text-neutral-900 fade--animation__heading sm:mt-3 sm:text-2xl md:text-3xl"
            dangerouslySetInnerHTML={{ __html: item.heading }}
          />

          <ButtonPrimary
            className="mt-4 !px-5 !py-2 !text-sm fade--animation__button sm:mt-5"
            href={item.btnHref || '#'}
          >
            <span className="me-2">{item.btnText}</span>
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </ButtonPrimary>
        </div>

        {/* SAĞ: sabit küçük kare görsel */}
        <div className="relative">
          <Link
            href={item.btnHref || '#'}
            className="relative mx-auto block aspect-square w-full max-w-[260px] overflow-hidden rounded-2xl fade--animation__image select-none shadow-md transition hover:opacity-95 sm:max-w-[300px]"
            aria-label={item.heading}
          >
            <Image
              sizes="300px"
              className="object-cover"
              src={item.imageUrl}
              alt={item.heading}
              fill
              priority
            />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('relative z-[1]', className)} {...handlers}>
      {data.map((_, index) => renderItem(index))}

      <button
        type="button"
        className="absolute inset-y-px end-0 z-10 hidden items-center justify-center px-10 text-neutral-700 lg:flex"
        onClick={handleClickNext}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={0.6}
          stroke="currentColor"
          className="h-12 w-12"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      <button
        type="button"
        className="absolute inset-y-px start-0 z-10 hidden items-center justify-center px-10 text-neutral-700 lg:flex"
        onClick={handleClickPrev}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={0.6}
          stroke="currentColor"
          className="h-12 w-12"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
    </div>
  )
}

export default SectionHero2
