import { TCollection } from '@/data/data'
import { Button } from '@/shared/Button/Button'
import Image from 'next/image'
import { FC } from 'react'
import { Link } from './Link'

interface Props {
  className?: string
  collection: TCollection
  ctaLabel?: string
  /** Override the card's link target. Falls back to `/collections/${handle}` when omitted. */
  href?: string
}

const CollectionCard3: FC<Props> = ({ className = '', collection, ctaLabel = 'Hepsini Gör', href }) => {
  const linkHref = href || (collection.handle ? '/collections/' + collection.handle : null)
  if (!linkHref) {
    return null
  }

  return (
    <div className={`group/CollectionCard3 relative block ${className}`}>
      <div
        className={`relative flex min-h-[300px] items-stretch gap-4 overflow-hidden rounded-2xl p-5 sm:min-h-[360px] sm:p-8 lg:min-h-[400px] ${collection.color}`}
      >
        {/* Text — left half */}
        <div className="relative z-10 flex w-1/2 flex-col pr-2">
          <div>
            <span className="mb-2 block text-sm text-neutral-700">{collection.title}</span>
            {collection.description && (
              <h2
                className="line-clamp-3 text-lg font-semibold text-neutral-900 sm:text-xl md:text-2xl"
                dangerouslySetInnerHTML={{ __html: collection.sortDescription || '' }}
              />
            )}
          </div>
          <div className="mt-auto pt-6">
            <Button color="light" className="[--btn-border:white]/0">
              {ctaLabel}
            </Button>
          </div>
        </div>

        {/* Image — right half */}
        {collection.image && (
          <div className="relative w-1/2 overflow-hidden rounded-2xl">
            <Image
              alt={collection.image.alt || ''}
              src={collection.image}
              fill
              className="object-cover object-center drop-shadow-xl"
              sizes="300px"
            />
          </div>
        )}

        <span className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover/CollectionCard3:opacity-40"></span>
      </div>

      <Link href={linkHref} className="absolute inset-0" />
    </div>
  )
}

export default CollectionCard3
