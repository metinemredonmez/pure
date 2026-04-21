'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FC, useState } from 'react'

export interface AnnouncementItem {
  text: string
  href: string
  cta: string
}

interface AnnouncementBarProps {
  announcements?: AnnouncementItem[]
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  { text: 'Taze kavrulmuş kahveniz kapınızda', href: '/collections/all', cta: 'Sipariş Ver' },
  { text: '₺300 üzeri siparişlerde ücretsiz kargo', href: '/collections/all', cta: 'Alışverişe Başla' },
  { text: 'Aylık kahve aboneliğinde %15 indirim', href: '/subscription', cta: 'Abone Ol' },
  { text: 'Kurumsal müşterilere özel fiyatlar', href: '/b2b', cta: 'Teklif Al' },
]

// Ornamental divider used between messages in the marquee
const Ornament: FC = () => (
  <span className="mx-8 flex items-center gap-2 text-white/30" aria-hidden>
    <span className="h-px w-6 bg-white/25" />
    <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor">
      <circle cx="5" cy="5" r="1.2" />
    </svg>
    <span className="h-px w-6 bg-white/25" />
  </span>
)

const AnnouncementBar: FC<AnnouncementBarProps> = ({ announcements: propAnnouncements }) => {
  const announcements =
    propAnnouncements && propAnnouncements.length > 0 ? propAnnouncements : DEFAULT_ANNOUNCEMENTS

  const [visible, setVisible] = useState(true)
  if (!visible) return null

  // Duplicate the list so the marquee loops seamlessly with CSS translateX(-50%)
  const loop = [...announcements, ...announcements]

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#4A2F1A] via-[#6B4423] to-[#4A2F1A] text-white">
      {/* Subtle top/bottom highlight lines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/20" aria-hidden />

      <div className="relative flex h-14 items-center">
        {/* Edge fade — left */}
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#4A2F1A] to-transparent sm:w-24"
          aria-hidden
        />
        {/* Edge fade — right */}
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-[#4A2F1A] to-transparent sm:w-28"
          aria-hidden
        />

        {/* Marquee track */}
        <div className="marquee-track flex min-w-max items-center whitespace-nowrap will-change-transform">
          {loop.map((item, i) => (
            <span key={`${item.text}-${i}`} className="flex items-center">
              <Link
                href={item.href}
                className="group flex items-center gap-3 py-4 transition-opacity hover:opacity-90"
              >
                {/* tiny bean glyph before each item */}
                <svg className="h-3.5 w-3.5 text-white/50" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.3" />
                  <path
                    d="M9 6.5c1.6 1.2 1.6 4 0 5.2-1.6 1.2-1.6 4 0 5.2M15 6.5c-1.6 1.2-1.6 4 0 5.2 1.6 1.2 1.6 4 0 5.2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[13.5px] font-medium tracking-wide sm:text-sm">
                  {item.text}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest transition-colors group-hover:border-white group-hover:bg-white group-hover:text-[#4A2F1A]">
                  {item.cta}
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
              <Ornament />
            </span>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Kapat"
        >
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 38s linear infinite;
        }
        /* Pause on hover — allows user to read & click */
        .marquee-track:hover {
          animation-play-state: paused;
        }
        /* Respect reduced-motion preference */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </div>
  )
}

export default AnnouncementBar
