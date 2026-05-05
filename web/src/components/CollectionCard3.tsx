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
        className={`relative flex flex-col items-center overflow-hidden rounded-2xl p-5 text-center sm:p-6 ${collection.color}`}
      >
        {/* Üstte: Üst Etiket (küçük) + Başlık */}
        <div className="relative z-10 w-full">
          <span className="mb-2 line-clamp-2 block text-xs leading-tight text-neutral-700 sm:text-sm">
            {collection.title}
          </span>
          {collection.description && (
            <h2
              className="line-clamp-3 text-base leading-snug font-semibold text-neutral-900 sm:text-lg md:text-xl"
              dangerouslySetInnerHTML={{ __html: collection.sortDescription || '' }}
            />
          )}
        </div>

        {/* Ortada: KARE görsel */}
        {collection.image && (
          <div className="relative my-5 aspect-square w-3/4 max-w-[260px] overflow-hidden rounded-2xl">
            <Image
              alt={collection.image.alt || ''}
              src={collection.image}
              fill
              className="object-cover object-center drop-shadow-xl"
              sizes="(min-width: 1024px) 260px, 200px"
            />
          </div>
        )}

        {/* Altta ortada: buton */}
        <div className="relative z-10">
          <Button color="light" className="!py-2 !px-6 !text-sm [--btn-border:white]/0">
            {ctaLabel}
          </Button>
        </div>

        <span className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover/CollectionCard3:opacity-40"></span>
      </div>

      <Link href={linkHref} className="absolute inset-0" />
    </div>
  )
}

export default CollectionCard3
