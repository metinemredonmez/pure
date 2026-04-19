'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const FALLBACK_SLIDES = [
  { src: '/hero/franchise-store.jpg', alt: 'Pure Olentia Mağaza' },
]

const INTERVAL = 5000

type Slide = { src: string; alt?: string }

function normalize(raw: any): Slide[] {
  if (!raw) return []
  // Accepts: string[] | {url|src|image, alt?}[] | single string
  if (typeof raw === 'string') return [{ src: raw, alt: 'Pure Olentia Mağaza' }]
  if (!Array.isArray(raw)) return []
  return raw
    .map((x: any) => {
      if (typeof x === 'string') return { src: x, alt: 'Pure Olentia Mağaza' }
      const src = x?.url || x?.src || x?.image
      if (!src) return null
      return { src, alt: x?.alt || x?.title || 'Pure Olentia Mağaza' }
    })
    .filter(Boolean) as Slide[]
}

function resolveUrl(src: string): string {
  if (!src) return ''
  if (src.startsWith('http')) return src
  // /uploads/* images are served from the API domain
  if (src.startsWith('/uploads/')) {
    const apiBase = API_URL.replace(/\/api\/?$/, '')
    return `${apiBase}${src}`
  }
  if (src.startsWith('/')) return src
  return `/${src}`
}

export default function FranchiseBanner() {
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    fetch(`${API_URL}/public/site-settings`)
      .then((r) => r.json())
      .then((res) => {
        const settings = res?.data || res || {}
        const raw = settings.franchiseBanners || settings.franchise_banners
        const list = normalize(raw)
        if (list.length > 0) setSlides(list)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), INTERVAL)
    return () => clearInterval(t)
  }, [slides.length])

  if (slides.length === 0) return null

  return (
    <div className="mt-10 relative aspect-[21/9] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-800">
      {slides.map((s, i) => (
        <div
          key={`${s.src}-${i}`}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === idx ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={resolveUrl(s.src)}
            alt={s.alt || 'Pure Olentia Mağaza'}
            fill
            sizes="100vw"
            className="object-cover"
            priority={i === 0}
            unoptimized={resolveUrl(s.src).startsWith('http')}
          />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === idx ? 'w-8 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
