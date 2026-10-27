'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import { getApiGoogleReviews } from '@/lib/api'
import { ArrowLeft02Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect, useState } from 'react'

interface GoogleReview {
  author: string
  rating: number
  text: string
  time: string
  profilePhoto?: string
}

const AVATAR_COLORS = [
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-fuchsia-600',
  'from-rose-500 to-pink-600',
  'from-blue-500 to-indigo-600',
  'from-cyan-500 to-sky-600',
]

function GoogleLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.991 21.991 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  )
}

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < count ? 'text-amber-400' : 'text-neutral-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.445a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.366-2.445a1 1 0 0 0-1.176 0l-3.366 2.445c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.299-3.957Z" />
        </svg>
      ))}
    </div>
  )
}

interface Props {
  className?: string
}

export default function SectionGoogleReviews({ className = '' }: Props) {
  const { t } = useTranslation()
  const emblaOptions: EmblaOptionsType = { align: 'start', slidesToScroll: 1, loop: true }
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
  const { onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)

  // Yalnızca Google'dan gelen gerçek yorumlar. Önceden 10 uydurma 5 yıldızlı yorum
  // (sitede olmayan "Ethiopia Yirgacheffe", "Kenya AA" ürünlerinden bahseden) basılıyordu.
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [aggregateRating, setAggregateRating] = useState<number>(0)
  const [reviewCount, setReviewCount] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = (await getApiGoogleReviews()) as any
      if (cancelled) return
      const data = res?.data || res
      const isReal = data?.source === 'live' || data?.source === 'cache'
      const list: GoogleReview[] = isReal && Array.isArray(data?.reviews) ? data.reviews : []
      if (!list.length) return
      setReviews(list)
      if (typeof data?.rating === 'number') setAggregateRating(data.rating)
      if (typeof data?.reviewCount === 'number') setReviewCount(data.reviewCount)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!reviews.length) return null

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-5 py-2.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <GoogleLogo className="h-5 w-5" />
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{t('reviews.google_reviews', 'Google Yorumları')}</span>
        </div>

        <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          {t('reviews.what_customers_say', 'Müşterilerimiz Ne Diyor?')}
        </h2>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <StarRating count={Math.round(aggregateRating)} />
            <span className="font-bold text-neutral-900 dark:text-white">{aggregateRating.toFixed(1)}</span>
          </div>
          <span className="text-neutral-400">·</span>
          <span className="text-neutral-600 dark:text-neutral-400">{t('reviews.google_count', '{count}+ Google yorumu', { count: reviewCount })}</span>
          <span className="text-neutral-400">·</span>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Olentia+Pure+Sancaktepe"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary-700 hover:underline dark:text-primary-400"
          >
            {t('reviews.see_on_google', "Google'da Görün")} →
          </a>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {reviews.map((r, i) => (
              <div key={i} className="flex-shrink-0 basis-full pl-4 sm:basis-1/2 lg:basis-1/3">
                <article className="group relative h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  {/* Google badge */}
                  <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-600">
                    <GoogleLogo className="h-4 w-4" />
                  </div>

                  {/* Author + rating */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-base font-bold text-white shadow-sm`}
                    >
                      {r.author[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{r.author}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{r.time}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <StarRating count={r.rating} />
                  </div>

                  {/* Quote */}
                  <div className="mt-4 relative">
                    <svg className="absolute -left-1 -top-2 h-6 w-6 text-amber-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M9 7H6c-1.7 0-3 1.3-3 3v3c0 1.7 1.3 3 3 3h2v3c0 1.7-1.3 3-3 3v2c2.8 0 5-2.2 5-5v-9c0-1.7-1.4-3-1-3zm12 0h-3c-1.7 0-3 1.3-3 3v3c0 1.7 1.3 3 3 3h2v3c0 1.7-1.3 3-3 3v2c2.8 0 5-2.2 5-5v-9c0-1.7-1.4-3-1-3z" />
                    </svg>
                    <p className="relative pl-6 text-sm leading-relaxed text-neutral-600 line-clamp-5 dark:text-neutral-300">
                      {r.text}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={onPrevButtonClick}
          aria-label={t('reviews.prev_review', 'Önceki yorum')}
          className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-neutral-200 transition hover:scale-110 sm:flex dark:bg-neutral-800 dark:ring-neutral-700"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} size={20} color="currentColor" strokeWidth={1.5} />
        </button>
        <button
          onClick={onNextButtonClick}
          aria-label={t('reviews.next_review', 'Sonraki yorum')}
          className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-neutral-200 transition hover:scale-110 sm:flex dark:bg-neutral-800 dark:ring-neutral-700"
        >
          <HugeiconsIcon icon={ArrowRight02Icon} size={20} color="currentColor" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
