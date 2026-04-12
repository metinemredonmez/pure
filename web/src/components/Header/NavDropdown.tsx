'use client'

import { TNavigationItem } from '@/data/navigation'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

interface NavDropdownProps {
  item: TNavigationItem
}

export default function NavDropdown({ item }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
      >
        {item.name}
        <svg className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-neutral-200 bg-white py-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={child.href || '/'}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-primary-50 hover:text-primary-700 dark:text-neutral-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
