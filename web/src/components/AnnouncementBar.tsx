'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from '@/contexts/LanguageContext'

export interface AnnouncementItem {
  text: string
  href: string
  cta: string
}

interface AnnouncementBarProps {
  announcements?: AnnouncementItem[]
}

const AnnouncementBar: FC<AnnouncementBarProps> = ({ announcements: propAnnouncements }) => {
  const { t } = useTranslation()

  const defaultAnnouncements: AnnouncementItem[] = [
    { text: t('announcement.fresh_roasted', 'Taze kavrulmuş kahveniz kapınızda'), href: '/collections/all', cta: t('announcement.order_now', 'Sipariş Ver') },
    { text: t('announcement.free_shipping', '₺300 üzeri siparişlerde ücretsiz kargo'), href: '/collections/all', cta: t('announcement.start_shopping', 'Alışverişe Başla') },
    { text: t('announcement.subscription_discount', 'Aylık kahve aboneliğinde %15 indirim'), href: '/subscription', cta: t('announcement.subscribe', 'Abone Ol') },
    { text: t('announcement.b2b_prices', 'Kurumsal müşterilere özel fiyatlar'), href: '/b2b', cta: t('announcement.get_quote', 'Teklif Al') },
  ]

  const announcements =
    propAnnouncements && propAnnouncements.length > 0 ? propAnnouncements : defaultAnnouncements

  const [visible, setVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((i) => (i === announcements.length - 1 ? 0 : i + 1))
        setIsAnimating(false)
      }, 350)
    }, 4500)
    return () => clearInterval(timer)
  }, [announcements.length])

  if (!visible) return null

  const current = announcements[currentIndex]

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#3D2817] via-[#5A3A1E] to-[#3D2817] text-white">
      {/* Top hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" aria-hidden />
      {/* Bottom hairline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/25" aria-hidden />

      <div className="container relative flex h-[60px] items-center">
        {/* LEFT: Coffee shop */}
        <div className="relative z-10 hidden shrink-0 items-center gap-x-2 pr-3 sm:flex">
          {/* Coffee cup with animated steam */}
          <svg className="h-8 w-8 text-amber-200/80" viewBox="0 0 32 32" fill="none">
            {/* Steam puffs (animated) */}
            <path
              d="M11 9 Q12 6 13 9"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="steam-puff-1"
            />
            <path
              d="M15 8 Q16 4 17 8"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="steam-puff-2"
            />
            <path
              d="M19 9 Q20 5 21 9"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="steam-puff-3"
            />

            {/* Cup */}
            <rect x="6" y="13" width="16" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
            {/* Handle */}
            <path
              d="M22 16 Q27 16 27 19.5 Q27 23 22 23"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Saucer */}
            <ellipse cx="14" cy="27.5" rx="12" ry="1.8" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          </svg>
          <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-white/50 lg:inline">
            Pure Olentia
          </span>
        </div>

        {/* CENTER: Rotating text */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div
            className={`flex items-center gap-x-3 transition-all duration-350 ease-out ${
              isAnimating ? '-translate-y-3 opacity-0 blur-[2px]' : 'translate-y-0 opacity-100 blur-0'
            }`}
          >
            <span className="text-[13px] font-medium tracking-wide sm:text-sm">{current.text}</span>
            <Link
              href={current.href}
              className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-white/30 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-[#3D2817]"
            >
              {current.cta}
              <svg className="h-3 w-3 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* RIGHT: Home (destination) — Sipariş Takibi'ne link */}
        <Link
          href="/siparis-takibi"
          className="relative z-10 hidden shrink-0 items-center gap-x-2 pl-3 transition hover:opacity-80 sm:flex"
          title={t('announcement.order_tracking', 'Sipariş Takibi')}
        >
          <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-white/50 lg:inline">
            {t('announcement.at_your_door', 'Kapınızda')}
          </span>
          <svg className="h-8 w-8 text-amber-200/80" viewBox="0 0 32 32" fill="none">
            {/* Roof */}
            <path
              d="M4 16 L16 6 L28 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Chimney */}
            <rect x="22" y="8" width="2.5" height="4" stroke="currentColor" strokeWidth="1.2" />
            {/* House body */}
            <rect x="7" y="16" width="18" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            {/* Door */}
            <rect x="13" y="20" width="6" height="9" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="17.5" cy="25" r="0.6" fill="currentColor" />
            {/* Window */}
            <rect x="9.5" y="19" width="2.5" height="2.5" stroke="currentColor" strokeWidth="1" />
            <rect x="20" y="19" width="2.5" height="2.5" stroke="currentColor" strokeWidth="1" />

            {/* Doorbell ring animation (small rays) */}
            <g className="door-ring">
              <path d="M28 13 L30 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M29 16 L31 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M28 19 L30 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </svg>
        </Link>

        {/* Scooter with coffee — rides to house, delivers, returns */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <div className="scooter-trip absolute top-1/2">
            {/* Speed lines behind scooter */}
            <div className="speed-lines absolute -left-10 top-1/2 flex -translate-y-1/2 flex-col gap-1">
              <span className="block h-0.5 w-8 rounded-full bg-amber-300/60" />
              <span className="block h-0.5 w-6 rounded-full bg-amber-300/45" />
              <span className="block h-0.5 w-7 rounded-full bg-amber-300/55" />
            </div>

            {/* Scooter SVG */}
            <svg className="h-7 w-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]" viewBox="0 0 48 28" fill="none">
              {/* Coffee box (with steam) */}
              <g>
                <rect x="2" y="6" width="7" height="10" rx="1.2" fill="#C28A52" opacity="0.95" />
                <rect x="2.5" y="6.5" width="6" height="2" fill="#8B5E3C" opacity="0.6" />
                <text x="5.5" y="13" fontSize="3.5" fill="#3D2817" fontWeight="700" textAnchor="middle">☕</text>
                {/* Box handle */}
                <path d="M3.5 4 Q5.5 3 7.5 4" stroke="#C28A52" strokeWidth="0.8" fill="none" />
                {/* Tiny steam from box */}
                <path d="M5.5 3 Q6 1 6.5 3" stroke="#fff" strokeWidth="0.6" strokeLinecap="round" opacity="0.7" className="box-steam" />
              </g>

              {/* Scooter body */}
              <rect x="10" y="10" width="18" height="7" rx="2" fill="#E8D4B8" opacity="0.95" />
              <rect x="13" y="8" width="11" height="3" rx="1" fill="#8B5E3C" opacity="0.9" />

              {/* Head + helmet */}
              <circle cx="24" cy="5.5" r="3" fill="#E8D4B8" />
              <path d="M21 4.5 Q24 1 27 4.5 L27 6 L21 6 Z" fill="#3D2817" />
              <circle cx="24" cy="6" r="0.5" fill="#fff" opacity="0.8" />

              {/* Arm holding handle */}
              <path d="M26 10 L32 5" stroke="#E8D4B8" strokeWidth="1.8" strokeLinecap="round" />
              {/* Handlebar */}
              <path d="M31 4 L34 2" stroke="#2A1810" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="34" cy="2" r="0.8" fill="#2A1810" />

              {/* Front mudguard */}
              <path d="M32 12 Q36 12 37 17" stroke="#2A1810" strokeWidth="1.2" fill="none" />

              {/* Wheels (spinning) */}
              <g className="wheel-spin" style={{ transformOrigin: '14px 21px' }}>
                <circle cx="14" cy="21" r="4" fill="#1A0F0A" />
                <circle cx="14" cy="21" r="2.2" fill="#3D2817" />
                <circle cx="14" cy="21" r="0.6" fill="#C28A52" />
                <path d="M14 17 L14 25 M10 21 L18 21" stroke="#C28A52" strokeWidth="0.4" opacity="0.6" />
              </g>
              <g className="wheel-spin" style={{ transformOrigin: '35px 21px' }}>
                <circle cx="35" cy="21" r="4" fill="#1A0F0A" />
                <circle cx="35" cy="21" r="2.2" fill="#3D2817" />
                <circle cx="35" cy="21" r="0.6" fill="#C28A52" />
                <path d="M35 17 L35 25 M31 21 L39 21" stroke="#C28A52" strokeWidth="0.4" opacity="0.6" />
              </g>

              {/* Exhaust puff */}
              <circle cx="6" cy="19" r="1.2" fill="#fff" opacity="0.3" className="exhaust-puff" />
            </svg>

            {/* Delivered! bubble — appears to the LEFT of scooter, vertically centered (avoids clipping above bar) */}
            <div className="delivered-bubble absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white opacity-0 shadow-lg">
              {t('announcement.delivered', '✓ Teslim edildi')}
            </div>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="absolute bottom-1.5 left-1/2 z-10 hidden -translate-x-1/2 gap-x-1 sm:flex">
          {announcements.map((_, i) => (
            <div
              key={i}
              className={`h-[3px] rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-4 bg-amber-200' : 'w-1.5 bg-white/25'
              }`}
            />
          ))}
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="relative z-10 ml-3 shrink-0 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
          aria-label={t('common.close', 'Kapat')}
        >
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <style jsx>{`
        /* Round-trip: enter left → cruise right → deliver at house → turn around → return left → restart */
        @keyframes scooterTrip {
          0%   { left: -90px; opacity: 0; transform: translateY(-50%) scaleX(1); }
          4%   { left: -60px; opacity: 1; transform: translateY(-50%) scaleX(1); }
          /* Cruising right */
          40%  { left: calc(100% - 130px); opacity: 1; transform: translateY(-50%) scaleX(1); }
          /* Arrived — delivering (pause, facing house) */
          48%  { left: calc(100% - 130px); opacity: 1; transform: translateY(-50%) scaleX(1); }
          52%  { left: calc(100% - 130px); opacity: 1; transform: translateY(-50%) scaleX(1); }
          /* Turn around */
          56%  { left: calc(100% - 130px); opacity: 1; transform: translateY(-50%) scaleX(-1); }
          /* Returning */
          92%  { left: -40px; opacity: 1; transform: translateY(-50%) scaleX(-1); }
          96%  { left: -80px; opacity: 1; transform: translateY(-50%) scaleX(-1); }
          100% { left: -100px; opacity: 0; transform: translateY(-50%) scaleX(-1); }
        }
        .scooter-trip { animation: scooterTrip 12s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

        /* Wheels spin continuously */
        @keyframes wheelSpin { to { transform: rotate(360deg); } }
        .wheel-spin { animation: wheelSpin 0.4s linear infinite; }

        /* Delivered bubble pops in while scooter is paused at house (40-52%) */
        @keyframes deliveredPop {
          0%, 40%   { opacity: 0; transform: translateY(4px) scale(0.7); }
          44%, 52%  { opacity: 1; transform: translateY(0) scale(1); }
          56%, 100% { opacity: 0; transform: translateY(-4px) scale(0.9); }
        }
        .delivered-bubble { animation: deliveredPop 12s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

        /* Steam puffs rising at different rates */
        @keyframes steamRise {
          0%, 100% { transform: translateY(0) scaleY(0.8); opacity: 0.4; }
          50%      { transform: translateY(-3px) scaleY(1.25); opacity: 1; }
        }
        .steam-puff-1 { animation: steamRise 1.9s ease-in-out infinite 0s; transform-origin: bottom; }
        .steam-puff-2 { animation: steamRise 2.3s ease-in-out infinite 0.3s; transform-origin: bottom; }
        .steam-puff-3 { animation: steamRise 2.1s ease-in-out infinite 0.6s; transform-origin: bottom; }

        /* Box steam — subtle rise from coffee box */
        @keyframes boxSteamRise {
          0%   { transform: translateY(0); opacity: 0.7; }
          100% { transform: translateY(-4px); opacity: 0; }
        }
        .box-steam { animation: boxSteamRise 1.2s ease-out infinite; transform-origin: bottom; }

        /* Exhaust puff */
        @keyframes exhaustPuff {
          0%   { opacity: 0.35; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.2) translateX(-3px); }
        }
        .exhaust-puff { animation: exhaustPuff 1s ease-out infinite; transform-origin: center; }

        /* Speed lines pulse */
        @keyframes speedPulse {
          0%, 100% { opacity: 0.6; transform: translateY(-50%) scaleX(1); }
          50%      { opacity: 1; transform: translateY(-50%) scaleX(0.5); }
        }
        .speed-lines { animation: speedPulse 0.4s ease-in-out infinite; transform-origin: right; }

        /* Door ring pulse during delivery (matches scooter pause 40-52%) */
        @keyframes doorRing {
          0%, 38%, 56%, 100% { opacity: 0; }
          42%, 52%           { opacity: 0.9; }
        }
        :global(.door-ring) { animation: doorRing 12s ease-in-out infinite; transform-origin: left center; }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .scooter-trip,
          .wheel-spin,
          .delivered-bubble,
          .steam-puff-1, .steam-puff-2, .steam-puff-3,
          .box-steam, .exhaust-puff, .speed-lines,
          :global(.door-ring) {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default AnnouncementBar
