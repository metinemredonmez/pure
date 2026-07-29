'use client'

import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import { ArrangeByLettersAZIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FC, Fragment, Suspense } from 'react'

// Backend `orderBy: { [sortBy]: sortOrder }` bekliyor → sortBy bir Prisma alan
// adı (createdAt/price/name), sortOrder asc|desc olmalı. Dostça etiketleri
// bu ikiliye eşliyoruz.
const SORT_OPTIONS = [
  { name: 'En Yeni', value: 'newest', sortBy: 'createdAt', sortOrder: 'desc' },
  { name: 'En Eski', value: 'oldest', sortBy: 'createdAt', sortOrder: 'asc' },
  { name: 'Fiyat: Düşükten Yükseğe', value: 'price-asc', sortBy: 'price', sortOrder: 'asc' },
  { name: 'Fiyat: Yüksekten Düşüğe', value: 'price-desc', sortBy: 'price', sortOrder: 'desc' },
  { name: "A'dan Z'ye", value: 'name-asc', sortBy: 'name', sortOrder: 'asc' },
  { name: "Z'den A'ya", value: 'name-desc', sortBy: 'name', sortOrder: 'desc' },
] as const

type Props = {
  className?: string
}

const SortInner: FC<Props> = ({ className }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSortBy = searchParams.get('sortBy') || 'createdAt'
  const currentSortOrder = searchParams.get('sortOrder') || 'desc'
  const selected =
    SORT_OPTIONS.find((o) => o.sortBy === currentSortBy && o.sortOrder === currentSortOrder) ||
    SORT_OPTIONS[0]

  const handleChange = (value: string) => {
    const opt = SORT_OPTIONS.find((o) => o.value === value)
    if (!opt) return
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('sortBy', opt.sortBy)
    params.set('sortOrder', opt.sortOrder)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className={clsx('product-sort-by-list-box flex shrink-0', className)}>
      <Listbox value={selected.value} onChange={handleChange}>
        <div className="relative">
          <ListboxButton
            className={clsx(
              'flex items-center justify-center rounded-full px-4 py-2.5 text-sm select-none ring-inset group-data-open:ring-2 group-data-open:ring-black hover:bg-neutral-50 focus:outline-hidden dark:group-data-open:ring-white dark:hover:bg-neutral-900',
              'ring-1 ring-neutral-300 dark:ring-neutral-700'
            )}
          >
            <HugeiconsIcon icon={ArrangeByLettersAZIcon} size={18} />
            <span className="ms-2">{selected.name}</span>
            <ChevronDownIcon className="ml-3 size-4" aria-hidden="true" />
          </ListboxButton>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <ListboxOptions className="absolute right-0 z-50 mt-2 max-h-60 w-52 overflow-auto rounded-xl bg-white py-1 text-sm text-neutral-900 shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-700">
              {SORT_OPTIONS.map((item) => (
                <ListboxOption
                  key={item.value}
                  className={({ focus: active }) =>
                    clsx(
                      'relative flex cursor-default py-2 ps-10 pe-4 select-none',
                      active && 'bg-primary-50 text-primary-700 dark:bg-neutral-700 dark:text-neutral-200'
                    )
                  }
                  value={item.value}
                >
                  {({ selected: isSelected }) => (
                    <>
                      <span className={clsx('block truncate', isSelected && 'font-medium')}>{item.name}</span>
                      {isSelected ? (
                        <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-primary-700 dark:text-neutral-200">
                          <CheckIcon className="size-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}

// useSearchParams() statik prerender'da Suspense sınırı gerektirir (CSR bailout).
export const FilterSortByMenuListBox: FC<Props> = (props) => (
  <Suspense fallback={<div className={clsx('flex shrink-0', props.className)} />}>
    <SortInner {...props} />
  </Suspense>
)
