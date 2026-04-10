'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'

const announcements = [
  { text: 'Taze kavrulmus kahveniz kapinizda!', href: '/collections/all', cta: 'Siparis Ver' },
  { text: '₺300 uzeri siparislerde ucretsiz kargo', href: '/collections/all', cta: 'Alisverise Basla' },
  { text: 'Aylik kahve aboneliginde %15 indirim', href: '/subscription', cta: 'Abone Ol' },
  { text: 'Kurumsal musterilere ozel fiyatlar', href: '/b2b', cta: 'Teklif Al' },
]

const AnnouncementBar: FC = () => {
  const [visible, setVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((i) => (i === announcements.length - 1 ? 0 : i + 1))
        setIsAnimating(false)
      }, 300)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  if (!visible) return null

  const current = announcements[currentIndex]

  return (
    <div className="relative overflow-hidden bg-primary-800 text-white">
      <div className="container relative flex h-11 items-center">

        {/* LEFT: Coffee shop icon */}
        <div className="hidden shrink-0 items-center gap-x-2 sm:flex">
          <svg className="h-7 w-7 text-white/60" viewBox="0 0 32 32" fill="none">
            {/* Cup body */}
            <rect x="6" y="12" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
            {/* Handle */}
            <path d="M22 15 Q27 15 27 19 Q27 23 22 23" stroke="currentColor" strokeWidth="1.5" fill="none" />
            {/* Saucer */}
            <ellipse cx="14" cy="28" rx="11" ry="2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            {/* Steam lines */}
            <path d="M10 10 Q11 7 12 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6">
              <animate attributeName="d" values="M10 10 Q11 7 12 10;M10 9 Q11 5 12 9;M10 10 Q11 7 12 10" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M15 9 Q16 5 17 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4">
              <animate attributeName="d" values="M15 9 Q16 5 17 9;M15 8 Q16 3 17 8;M15 9 Q16 5 17 9" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>

        {/* Dotted line left */}
        <div className="hidden flex-1 items-center px-3 sm:flex">
          <div className="h-0 w-full border-t border-dashed border-white/15" />
        </div>

        {/* CENTER: Text */}
        <div className="flex flex-1 items-center justify-center sm:flex-none">
          <div
            className={`flex items-center gap-x-3 transition-all duration-300 ease-out ${
              isAnimating ? '-translate-y-5 opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            <span className="text-xs font-medium sm:text-[13px]">{current.text}</span>
            <Link
              href={current.href}
              className="shrink-0 rounded-full border border-white/25 px-3 py-0.5 text-[11px] font-medium transition-colors hover:bg-white hover:text-primary-800"
            >
              {current.cta}
            </Link>
          </div>
        </div>

        {/* Dotted line right */}
        <div className="hidden flex-1 items-center px-3 sm:flex">
          <div className="h-0 w-full border-t border-dashed border-white/15" />
        </div>

        {/* RIGHT: Home icon */}
        <div className="hidden shrink-0 items-center gap-x-2 sm:flex">
          <svg className="h-7 w-7 text-white/60" viewBox="0 0 32 32" fill="none">
            {/* Roof */}
            <path d="M4 16 L16 6 L28 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* House body */}
            <rect x="7" y="16" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
            {/* Door */}
            <rect x="13" y="21" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
            <circle cx="17.5" cy="25.5" r="0.7" fill="currentColor" />
            {/* Heart/welcome */}
            <path d="M14.5 17.5 Q16 15 17.5 17.5 Q16 20 14.5 17.5Z" fill="currentColor" opacity="0.3" />
          </svg>
        </div>

        {/* Delivery scooter - appears, rides across, disappears, repeats */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div className="scooter-ride absolute top-1/2 -translate-y-1/2">
            <svg className="h-5 w-8 text-white/40" viewBox="0 0 40 24" fill="currentColor">
              {/* Body */}
              <rect x="8" y="6" width="16" height="8" rx="2.5" fillOpacity="0.9" />
              {/* Head */}
              <circle cx="20" cy="3.5" r="2.5" fillOpacity="0.85" />
              {/* Coffee box */}
              <rect x="2" y="4" width="6" height="8" rx="1.5" fillOpacity="0.95" />
              {/* Wheels */}
              <circle cx="11" cy="18" r="3.5" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="28" cy="18" r="3.5" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.8" />
              {/* Handlebar */}
              <path d="M24 6 L30 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
            </svg>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-[3px] left-1/2 hidden -translate-x-1/2 gap-x-1 sm:flex">
          {announcements.map((_, i) => (
            <div
              key={i}
              className={`h-[2px] rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-3 bg-white/70' : 'w-1 bg-white/25'
              }`}
            />
          ))}
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="ml-3 shrink-0 text-white/25 hover:text-white"
          aria-label="Kapat"
        >
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <style jsx>{`
        @keyframes scooterRide {
          0% { left: -40px; opacity: 0; }
          5% { opacity: 1; }
          45% { left: calc(50% - 16px); opacity: 1; }
          55% { left: calc(50% - 16px); opacity: 1; }
          95% { opacity: 1; }
          100% { left: calc(100% + 40px); opacity: 0; }
        }
        .scooter-ride {
          animation: scooterRide 7s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default AnnouncementBar
