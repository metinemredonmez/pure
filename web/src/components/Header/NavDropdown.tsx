'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { TNavigationItem } from '@/data/navigation'
import Link from 'next/link'
import TransLabel from '@/components/TransLabel'

interface NavDropdownProps {
  item: TNavigationItem
}

const NAV_OPEN_EVENT = 'navdropdown:open'

const svgProps = {
  className: 'h-6 w-6',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'turk-kahvesi': (
    <svg {...svgProps}>
      {/* cezve gövdesi + sol ağız */}
      <path d="M8 9L6 20H16L14 9Z" />
      <path d="M8 9L5.5 7.5" />
      <path d="M7.2 13H14.8" />
      {/* uzun sap */}
      <path d="M14.4 11H21" />
      {/* buhar */}
      <path d="M10 2.5q-1 1 0 2t0 2" />
      <path d="M13 2.5q-1 1 0 2t0 2" />
    </svg>
  ),
  'filtre-kahve': (
    <svg {...svgProps}>
      {/* kenar */}
      <path d="M5 3H19" />
      {/* koni */}
      <path d="M6 3L10.5 11H13.5L18 3" />
      {/* damlalar */}
      <path d="M12 12.5V13.5" />
      {/* sürahi/fincan */}
      <path d="M7 15.5H17V18A3 3 0 0 1 14 21H10A3 3 0 0 1 7 18Z" />
    </svg>
  ),
  'espresso': (
    <svg {...svgProps}>
      <path d="M5 10H16V14A4 4 0 0 1 12 18H9A4 4 0 0 1 5 14Z" />
      <path d="M16 11H17.5A2 2 0 0 1 17.5 15H15.8" />
      <path d="M3 20.5H18.5" />
      <path d="M8 3q-1 1.5 0 3" />
      <path d="M12 3q-1 1.5 0 3" />
    </svg>
  ),
  'kapsul-kahve': (
    <svg {...svgProps}>
      <path d="M6 4H18V7H6Z" />
      <path d="M7 7L9 20H15L17 7" />
    </svg>
  ),
  'bireysel': (
    <svg {...svgProps}>
      {/* kahve paketi */}
      <path d="M7 6H17L18 20H6Z" />
      <path d="M7 6V4H17V6" />
      {/* tekrar oku */}
      <path d="M9.5 13a2.5 2.5 0 0 1 4.3-1.7" />
      <path d="M14 9.8V11.4H12.4" />
      <path d="M14.5 13a2.5 2.5 0 0 1-4.3 1.7" />
      <path d="M10 16.2V14.6H11.6" />
    </svg>
  ),
  'kurumsal-ab': (
    <svg {...svgProps}>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7H9.01M15 7H15.01M9 11H9.01M15 11H15.01" />
      <path d="M10 21V17H14V21" />
    </svg>
  ),
}

export default function NavDropdown({ item }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const itemId = item.id

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
    window.dispatchEvent(new CustomEvent(NAV_OPEN_EVENT, { detail: itemId }))
  }, [itemId])

  const handleLeave = useCallback(() => {
    // 150ms grace — mouse'un parent'tan dropdown'a köprülenmesi için yeterli süre
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }, [])

  useEffect(() => {
    const onOtherOpen = (e: Event) => {
      if ((e as CustomEvent).detail !== itemId) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setOpen(false)
      }
    }
    window.addEventListener(NAV_OPEN_EVENT, onOtherOpen)
    return () => {
      window.removeEventListener(NAV_OPEN_EVENT, onOtherOpen)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [itemId])

  if (!item.children?.length) {
    return (
      <Link
        href={item.href || '/'}
        className="text-sm font-medium text-neutral-700 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
      >
        <TransLabel tr={item.name} />
      </Link>
    )
  }

  const hasIcons = item.children.some((c) => c.icon)

  return (
    <div
      className="relative py-4"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false)
      }}
    >
      <Link
        href={item.href || '/'}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
      >
        <TransLabel tr={item.name} />
        <svg className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </Link>

      <div
        className={`absolute left-0 top-full z-50 transition duration-200 ease-out ${
          open
            ? 'visible opacity-100 translate-y-0 pointer-events-auto'
            : 'invisible opacity-0 -translate-y-1 pointer-events-none'
        }`}
        aria-hidden={!open}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div className={`rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900 ${hasIcons ? 'min-w-[300px] p-3' : 'min-w-[200px] py-2'}`}>
          {item.children.map((child) => {
            const icon = child.icon ? CATEGORY_ICONS[child.icon] : null

            return hasIcons && icon ? (
              <Link
                key={child.id}
                href={child.href || '/'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-primary-50 dark:hover:bg-primary-900/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  {icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white"><TransLabel tr={child.name} /></div>
                  {child.description && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{child.description}</div>
                  )}
                </div>
              </Link>
            ) : (
              <Link
                key={child.id}
                href={child.href || '/'}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-primary-50 hover:text-primary-700 dark:text-neutral-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
              >
                <TransLabel tr={child.name} />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
