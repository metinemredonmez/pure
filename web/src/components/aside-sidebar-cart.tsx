'use client'

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
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">Sepetiniz boş</p>
              <Link
                href="/collections/all"
                className="mt-4 text-sm font-medium text-primary-600 hover:underline"
              >
                Alışverişe başla →
              </Link>
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
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {image && (
          <Image
            fill
            src={image}
            alt={name}
            className="object-contain"
            sizes="200px"
          />
        )}
        <Link className="absolute inset-0" href={'/products/' + handle} />
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
