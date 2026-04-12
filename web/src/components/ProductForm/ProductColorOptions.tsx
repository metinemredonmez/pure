'use client'

import { TProductItem } from '@/data/data'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'

const ROAST_LABELS: Record<string, string> = {
  light: 'Açık Kavurma',
  medium: 'Orta Kavurma',
  'medium-dark': 'Orta-Koyu',
  dark: 'Koyu Kavurma',
}

const ProductColorOptions = ({
  options,
  className,
  defaultColor,
}: {
  options: TProductItem['options']
  className?: string
  defaultColor: string
}) => {
  const [selected, setSelected] = useState(defaultColor)

  const optionValues = options?.find((option) => option.name === 'Kavurma')?.optionValues

  if (!optionValues?.length) {
    return null
  }

  return (
    <Headless.Field className={clsx(className)}>
      <Headless.RadioGroup value={selected} name="roast" onChange={setSelected} aria-label="Kavurma Profili">
        <Headless.Label className="block text-sm font-medium rtl:text-right">Kavurma Profili</Headless.Label>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {optionValues.map((value) => {
            const isActive = value.name === selected
            const label = ROAST_LABELS[value.name.toLowerCase()] || value.name

            return (
              <Headless.Radio
                key={value.name}
                value={value.name}
                as="button"
                type="button"
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300'
                )}
              >
                {label}
              </Headless.Radio>
            )
          })}
        </div>
      </Headless.RadioGroup>
    </Headless.Field>
  )
}

export default ProductColorOptions
