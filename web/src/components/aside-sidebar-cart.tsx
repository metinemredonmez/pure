'use client'

import { DeliveryTruck01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { CartItem, useCart } from '@/contexts/CartContext'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { Link } from './Link'
import Prices from './Prices'
import { Aside } from './aside/aside'

const AsideSidebarCart = () => {
  const { items, subtotal, removeItem, updateQuantity } = useCart()

  return (
    <Aside openFrom="right" type="cart" heading="Alışveriş Sepeti">
      <div className="flex h-full flex-col">
        {/* CONTENT */}
        <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              {/* Empty cart illustration */}
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
                <svg className="h-14 w-14 text-primary-300 dark:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Sepetiniz boş
              </h3>
              <p className="mt-2 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
                Henüz sepetinize ürün eklemediniz. Taze kavrulmuş kahvelerimizi keşfedin!
              </p>
              <Link
                href="/collections/all"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-800"
              >
                Kahveleri Keşfet
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <div className="mt-8 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  <HugeiconsIcon icon={DeliveryTruck01Icon} size={14} color="currentColor" strokeWidth={1.5} className="inline-block" /> 300 TL üzeri siparişlerde <span className="text-primary-700 dark:text-primary-400">ücretsiz kargo</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flow-root">
              <ul role="list" className="-my-6 divide-y divide-neutral-900/10 dark:divide-neutral-100/10">
                {items.map((product) => (
                  <CartProduct
                    key={product.id}
                    product={product}
                    onRemove={() => removeItem(product.id)}
                    onQuantityChange={(qty) => updateQuantity(product.id, qty)}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <section
            aria-labelledby="summary-heading"
            className="mt-auto grid shrink-0 gap-4 border-t border-neutral-900/10 py-6 dark:border-neutral-100/10"
          >
            <h2 id="summary-heading" className="sr-only">
              Sipariş özeti
            </h2>
            <div>
              <div className="flex justify-between text-base font-medium text-gray-900 dark:text-neutral-100">
                <p className="font-medium">Ara Toplam</p>
                <p className="font-medium">₺{subtotal.toLocaleString('tr-TR')}</p>
              </div>
              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                Kargo ve vergiler ödeme sırasında hesaplanır.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <ButtonSecondary href="/cart">Sepeti Gör</ButtonSecondary>
                <ButtonPrimary href="/checkout">Ödemeye Geç</ButtonPrimary>
              </div>
              <div className="mt-6 flex justify-center text-center text-sm text-neutral-500 dark:text-neutral-400">
                <p className="text-xs">
                  <Link href="/collections/all" className="text-xs font-medium uppercase">
                    Alışverişe Devam Et<span aria-hidden="true"> →</span>
                  </Link>
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </Aside>
  )
}

const CartProduct = ({
  product,
  onRemove,
  onQuantityChange,
}: {
  product: CartItem
  onRemove: () => void
  onQuantityChange: (qty: number) => void
}) => {
  const { name, price, image, size, color, quantity, handle } = product

  return (
    <div className="flex py-5 last:pb-0">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-primary-50 dark:from-neutral-800 dark:to-neutral-900">
        {image ? (
          <Image
            fill
            src={image}
            alt={name}
            className="object-cover"
            sizes="200px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-10 w-10 text-primary-700/50 dark:text-primary-400/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {/* steam */}
              <path d="M8 3c0 1 1 1 1 2M11 3c0 1 1 1 1 2M14 3c0 1 1 1 1 2" opacity="0.55" />
              {/* cup */}
              <path d="M3 8h13v6a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
              <path d="M16 10h1a3 3 0 010 6h-1" />
              {/* saucer */}
              <path d="M2 21h16" opacity="0.55" />
            </svg>
          </div>
        )}
        <Link className="absolute inset-0" href={handle === 'subscription' ? '/subscription' : '/products/' + handle} />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between">
            <div>
              <h3 className="text-base font-medium">
                <Link href={'/products/' + handle}>{name}</Link>
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {color && <span>{color}</span>}
                {color && size && <span className="mx-2 h-4 border-l border-neutral-200 dark:border-neutral-700"></span>}
                {size && <span>{size}</span>}
              </p>
            </div>
            <Prices price={price || 0} className="mt-0.5" />
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="inline-grid w-full max-w-16 grid-cols-1">
            <select
              name={`quantity-${product.id}`}
              aria-label={`Adet, ${name}`}
              className="col-start-1 row-start-1 appearance-none rounded-md py-0.5 ps-3 pe-8 text-xs/6 outline-1 -outline-offset-1 outline-neutral-900/10 focus:outline-1 dark:outline-white/15"
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 me-2 size-4 self-center justify-self-end text-neutral-500 dark:text-neutral-400"
            />
          </div>

          <div className="flex">
            <button
              type="button"
              onClick={onRemove}
              className="font-medium text-primary-600 dark:text-primary-500"
            >
              Kaldır
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AsideSidebarCart
