'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import { TProductItem } from '@/data/data'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'

const ProductColorOptions = ({
  options,
  className,
  defaultColor,
}: {
  options: TProductItem['options']
  className?: string
  defaultColor: string
}) => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(defaultColor)

  const roastLabels: Record<string, string> = {
    light: t('product.roast_light', 'Açık Kavurma'),
    medium: t('product.roast_medium', 'Orta Kavurma'),
    'medium-dark': t('product.roast_medium_dark', 'Orta-Koyu'),
    dark: t('product.roast_dark', 'Koyu Kavurma'),
  }

  const optionValues = options?.find((option) => option.name === 'Kavurma')?.optionValues

  if (!optionValues?.length) {
    return null
  }

  return (
    <Headless.Field className={clsx(className)}>
      <Headless.RadioGroup value={selected} name="roast" onChange={setSelected} aria-label={t('product.roast_profile', 'Kavurma Profili')}>
        <Headless.Label className="block text-sm font-medium rtl:text-right">{t('product.roast_profile', 'Kavurma Profili')}</Headless.Label>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {optionValues.map((value) => {
            const isActive = value.name === selected
            const label = roastLabels[value.name.toLowerCase()] || value.name

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
