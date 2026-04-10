import { TCollection } from '@/data/data'
import { ArrowUpRightIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'

interface CollectionCard4Props {
  className?: string
  bgSvgUrl?: string
  collection: TCollection
}

const CollectionCard4: FC<CollectionCard4Props> = ({ className, bgSvgUrl, collection }) => {
  if (!collection.handle) {
    return null
  }
  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-3xl bg-white p-5 transition-shadow hover:nc-shadow-lg sm:p-8 dark:bg-neutral-900',
        className
      )}
    >
      {bgSvgUrl && (
        <div className="pointer-events-none absolute end-0 bottom-0 size-52 opacity-40 sm:size-64 xl:size-72">
          <Image src={bgSvgUrl} alt={'bgSVG'} fill className="object-contain object-bottom-right" />
        </div>
      )}

      <div className="relative flex flex-col justify-between">
        <div className="flex items-start justify-between gap-x-4">
          <div className="max-w-[65%] pr-2">
            <p
              className="text-sm text-neutral-500 dark:text-neutral-400"
              dangerouslySetInnerHTML={{ __html: collection.sortDescription || '' }}
            />
            <h2
              className="mt-2 text-xl font-semibold sm:text-2xl break-words"
              dangerouslySetInnerHTML={{ __html: collection.title || '' }}
            />
          </div>
          {collection.image?.src && (
            <div
              className={clsx(
                'relative size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28',
                collection.color
              )}
            >
              <div className="absolute inset-2">
                <Image
                  alt={collection.image?.alt}
                  src={collection.image}
                  fill
                  sizes="120px"
                  className="rounded-xl object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between sm:mt-16">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{collection.count} ürün</p>
          <ArrowUpRightIcon className="size-6 text-neutral-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:scale-110" />
        </div>

        <Link href={'/collections/' + collection.handle} className="absolute inset-0"></Link>
      </div>
    </div>
  )
}

export default CollectionCard4
