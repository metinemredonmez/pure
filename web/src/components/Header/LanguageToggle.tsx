'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import { LOCALES } from '@/i18n/messages'
import { Popover, PopoverButton, PopoverPanel, type PopoverPanelProps } from '@headlessui/react'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { FC } from 'react'

interface Props {
  className?: string
  panelAnchor?: PopoverPanelProps['anchor']
}

const LanguageToggle: FC<Props> = ({ className, panelAnchor = 'bottom end' }) => {
  const { locale, setLocale } = useTranslation()
  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0]

  return (
    <div className={className}>
      <Popover>
        <PopoverButton className="-m-2.5 flex items-center p-2.5 text-sm font-medium text-gray-800 focus:outline-hidden dark:text-neutral-200">
          <GlobeAltIcon className="size-[18px] opacity-80" />
          <span className="ms-1.5 uppercase">{current.code}</span>
          <ChevronDownIcon className="ms-1 size-4" aria-hidden="true" />
        </PopoverButton>

        <PopoverPanel
          anchor={panelAnchor}
          transition
          className="z-10 mt-4 w-44 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5 transition duration-200 data-closed:translate-y-1 data-closed:opacity-0 dark:bg-neutral-800"
        >
          {({ close }) => (
            <div className="space-y-1">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLocale(l.code)
                    close()
                  }}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    locale === l.code
                      ? 'bg-neutral-100 font-medium dark:bg-neutral-700'
                      : 'opacity-80'
                  )}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </PopoverPanel>
      </Popover>
    </div>
  )
}

export default LanguageToggle
