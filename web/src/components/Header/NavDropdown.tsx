'use client'

import React, { useState, useRef, useCallback } from 'react'
import { TNavigationItem } from '@/data/navigation'
import Link from 'next/link'

interface NavDropdownProps {
  item: TNavigationItem
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'turk-kahvesi': (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8" />
      <path d="M3 8H21V8C21 13.5228 17.5228 17 12 17C6.47715 17 3 13.5228 3 8V8Z" />
      <path d="M8 20H16" /><path d="M12 17V20" />
      <path d="M10 4C10 4 10.5 2 12 2C13.5 2 14 4 14 4" />
    </svg>
  ),
  'filtre-kahve': (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4L18 4L15 20H9L6 4Z" />
      <path d="M4 4H20" /><path d="M10 9L14 9" />
    </svg>
  ),
  'espresso': (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="5" y="8" width="14" height="12" rx="2" />
      <path d="M19 11H20C21.1046 11 22 11.8954 22 13C22 14.1046 21.1046 15 20 15H19" />
      <path d="M9 5C9 5 9.5 3 12 3C14.5 3 15 5 15 5" />
    </svg>
  ),
  'kapsul-kahve': (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="4" width="8" height="16" rx="4" /><path d="M8 12H16" />
    </svg>
  ),
}

export default function NavDropdown({ item }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }, [])

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }, [])

  if (!item.children?.length) {
    return (
      <Link
        href={item.href || '/'}
        className="text-sm font-medium text-neutral-700 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
      >
        {item.name}
      </Link>
    )
  }

  const hasIcons = item.children.some((c) => c.icon)

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        href={item.href || '/'}
        className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
      >
        {item.name}
        <svg className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </Link>

      {open && (
        <div
          className="absolute left-0 top-full z-50 pt-2"
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-primary-700 dark:bg-neutral-800 dark:text-primary-400">
                    {icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">{child.name}</div>
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
                  {child.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
