'use client'

import { useState } from 'react'

interface FaqItem {
  q: string
  a: string
}

export default function SssFaq({ questions }: { questions: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {questions.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={idx}
            className={`overflow-hidden rounded-2xl border transition-all ${
              isOpen
                ? 'border-primary-300 bg-primary-50/50 shadow-sm dark:border-primary-700 dark:bg-primary-900/20'
                : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between px-6 py-5 text-left"
            >
              <span className="pr-4 text-base font-semibold text-neutral-900 dark:text-white">{item.q}</span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm transition-transform ${
                  isOpen
                    ? 'rotate-45 bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5">
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{item.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
