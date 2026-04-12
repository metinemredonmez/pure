'use client'

import { TProductItem } from '@/data/data'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'

const ProductSizeOptions = ({
  options,
  className,
  defaultSize,
}: {
  options: TProductItem['options']
  className?: string
  defaultSize: string
}) => {
  const [sizeSelected, setSizeSelected] = useState(defaultSize)

  if (!options?.length) {
    return null
  }
  const sizeOptionValues = options?.find((option) => option.name === 'Gramaj')?.optionValues

  if (!sizeOptionValues?.length) {
    return null
  }

  return (
    <Headless.Field className={clsx(className)}>
      <Headless.RadioGroup value={sizeSelected} onChange={setSizeSelected} aria-label="gramaj" name="gramaj">
        <Headless.Label className="block text-sm font-medium">Gramaj</Headless.Label>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {sizeOptionValues.map((size) => {
            const isActive = size.name === sizeSelected
            return (
              <Headless.Radio
                key={size.name}
                value={size.name}
                as="div"
                className={clsx(
                  'relative flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-medium text-neutral-900 select-none hover:bg-neutral-50 sm:h-11 dark:text-neutral-200 dark:hover:bg-neutral-700',
                  isActive
                    ? 'ring-2 ring-neutral-900 dark:ring-neutral-200'
                    : 'ring-1 ring-neutral-200 dark:ring-neutral-500'
                )}
              >
                {size.name}
              </Headless.Radio>
            )
          })}
        </div>
      </Headless.RadioGroup>
    </Headless.Field>
  )
}

export default ProductSizeOptions
