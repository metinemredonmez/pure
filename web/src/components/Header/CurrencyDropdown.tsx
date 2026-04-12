'use client'

import { getCurrencies } from '@/data/navigation'
import { Popover, PopoverButton, PopoverPanel, type PopoverPanelProps } from '@headlessui/react'
import { ChevronDownIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { FC, useState } from 'react'

interface Props {
  className?: string
  currencies: Awaited<ReturnType<typeof getCurrencies>>
  panelAnchor?: PopoverPanelProps['anchor']
}

const CurrencyDropdown: FC<Props> = ({ className, currencies, panelAnchor = 'bottom end' }) => {
  const [selected, setSelected] = useState(currencies[0]?.name || '₺ TRY')

  return (
    <div className={className}>
      <Popover>
        <PopoverButton className="-m-2.5 flex items-center p-2.5 text-sm font-medium text-gray-800 focus:outline-hidden dark:text-neutral-200">
          <CurrencyDollarIcon className="size-[18px] opacity-80" />
          <span className="ms-1.5">{selected}</span>
          <ChevronDownIcon className="ms-1 size-4" aria-hidden="true" />
        </PopoverButton>

        <PopoverPanel
          anchor={panelAnchor}
          transition
          className="z-10 mt-4 w-56 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition duration-200 data-closed:translate-y-1 data-closed:opacity-0 dark:bg-neutral-800"
        >
          <div className="space-y-1">
            {currencies.map((currency) => (
              <button
                key={currency.name}
                type="button"
                onClick={() => setSelected(currency.name)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  selected === currency.name
                    ? 'bg-neutral-100 font-semibold dark:bg-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-300'
                )}
              >
                <span className="size-5 shrink-0" dangerouslySetInnerHTML={{ __html: currency.icon }} />
                <span>{currency.name}</span>
              </button>
            ))}
          </div>
        </PopoverPanel>
      </Popover>
    </div>
  )
}

export default CurrencyDropdown
