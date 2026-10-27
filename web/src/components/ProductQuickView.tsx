'use client'

import AccordionInfo from '@/components/AccordionInfo'
import LikeButton from '@/components/LikeButton'
import ProductBuyBox from '@/components/ProductForm/ProductBuyBox'
import { useTranslation } from '@/contexts/LanguageContext'
import { adaptProduct } from '@/lib/adapters'
import { getApiProductBySlug } from '@/lib/api'
import { Link } from '@/shared/link'
import { StarIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { FC, useEffect, useState } from 'react'
import { Divider } from './Divider'
import { useAside } from './aside'

interface ProductQuickViewProps {
  className?: string
}

// Hızlı bakış gerçek ürünü backend'den çeker. Önceden template'in demo verisinden
// (data.ts) okunuyordu: her üründe "Ethiopia Yirgacheffe ₺85" görünüyor, sepete de
// sahte id'li demo ürün ekleniyordu.
const ProductQuickView: FC<ProductQuickViewProps> = ({ className }) => {
  const { productQuickViewHandle: handle } = useAside()
  const { t } = useTranslation()

  const [product, setProduct] = useState<any>()
  const [loadedHandle, setLoadedHandle] = useState<string>()

  useEffect(() => {
    if (!handle) {
      return
    }
    let cancelled = false
    getApiProductBySlug(handle)
      .then((res: any) => {
        if (cancelled) return
        setProduct(res?.data?.id ? adaptProduct(res.data) : undefined)
        setLoadedHandle(handle)
      })
      .catch(() => {
        if (cancelled) return
        setProduct(undefined)
        setLoadedHandle(handle)
      })
    return () => {
      cancelled = true
    }
  }, [handle])

  // Başka ürüne geçerken önceki ürün bir an bile görünmesin
  if (!handle || loadedHandle !== handle) {
    return null
  }

  if (!product) {
    return (
      <p className="py-10 text-center text-sm text-neutral-500">
        {t('product.not_found', 'Ürün bulunamadı.')}
      </p>
    )
  }

  const { title, rating, reviewNumber, images, shortDescription, description } = product
  const summary = shortDescription || description

  return (
    <div className={className}>
      <div className="lg:flex">
        <div className="w-full lg:w-[50%]">
          <div className="relative">
            <div className="aspect-w-16 aspect-h-16">
              {images?.[0] && (
                <Image
                  src={images[0]}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full rounded-xl object-cover"
                  alt={images[0].alt}
                />
              )}
            </div>
            <LikeButton productId={product.id} className="absolute end-3 top-3" />
          </div>
          {/* Yüklenen ek fotoğraflar (varsa) — tekrar eden yer tutucu yok */}
          {images?.length > 1 && (
            <div className="mt-3 hidden grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid xl:mt-5 xl:gap-5">
              {images.slice(1, 3).map((image: any, index: number) => (
                <div key={index} className="aspect-w-3 aspect-h-4">
                  <Image
                    fill
                    src={image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full rounded-xl object-cover"
                    alt={image.alt}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="w-full pt-6 lg:w-[50%] lg:ps-7 lg:pt-0 xl:ps-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold">
                <Link href={`/products/${handle}`}>{title}</Link>
              </h2>
              {reviewNumber > 0 && (
                <Link href={'/products/' + handle} className="mt-4 flex items-center text-sm font-medium">
                  <StarIcon className="h-5 w-5 pb-px text-yellow-400" />
                  <div className="ms-1.5 flex">
                    <span>{rating}</span>
                    <span className="mx-2 block">·</span>
                    <span className="text-neutral-600 underline dark:text-neutral-400">
                      {t('product.reviews_count', '{count} değerlendirme', { count: reviewNumber })}
                    </span>
                  </div>
                </Link>
              )}
            </div>

            {/* Fiyat (indirim), kavurma / öğütme / gramaj seçimi ve sepete ekleme —
                ürün sayfasıyla aynı bileşen: siparişe gerçek varyant id'si gider */}
            <ProductBuyBox product={product} />

            <Divider />

            <AccordionInfo
              data={[
                ...(summary ? [{ name: t('product.section_description', 'Açıklama'), content: summary }] : []),
                {
                  name: t('product.section_shipping_returns', 'Kargo & İade'),
                  content: t(
                    'product.shipping_returns_body',
                    '₺300 üzeri siparişlerde ücretsiz kargo. Ürünlerimiz açılmamış ambalajında 14 gün içinde iade edilebilir.'
                  ),
                },
              ]}
            />

            <div className="mt-6 flex text-sm text-neutral-500">
              <p className="text-xs">
                {t('common.or', 'veya')}{' '}
                <Link href={'/products/' + handle} className="text-xs font-medium text-neutral-900 uppercase">
                  {t('product.go_to_detail', 'Ürün detay sayfasına git')} <span aria-hidden="true"> →</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductQuickView
