'use client'

import Prices from '@/components/Prices'
import { useCart } from '@/contexts/CartContext'
import { Link } from '@/shared/link'
import { Transition } from '@headlessui/react'
import Image from 'next/image'
import React, { ComponentType, ElementType, FC } from 'react'
import toast from 'react-hot-toast'

interface NotifyAddToCartProps extends AddToCardButtonProps {
  show: boolean
}

export const NotifyAddToCart: FC<NotifyAddToCartProps & { totalItems?: number; cartTotal?: number }> = ({ show, color, imageUrl, price, quantity, title, size, totalItems, cartTotal }) => {
  return (
    <Transition
      appear
      as={'div'}
      show={show}
      className="pointer-events-auto w-full max-w-md rounded-2xl bg-white p-5 text-neutral-900 shadow-2xl ring-1 ring-black/5 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-white/10"
      enter="transition-all duration-200"
      enterFrom="opacity-0 translate-x-20 scale-95"
      enterTo="opacity-100 translate-x-0 scale-100"
      leave="transition-all duration-150"
      leaveFrom="opacity-100 translate-x-0"
      leaveTo="opacity-0 translate-x-20"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold">Sepete eklendi!</p>
      </div>

      <div className="mt-4 flex gap-3">
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          <Image src={imageUrl} alt={title} fill sizes="80px" className="object-contain" />
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold leading-tight">{title}</h3>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {color && <span>{color}</span>}
              {color && size && <span> · </span>}
              {size && <span>{size}</span>}
              {quantity > 1 && <span> · Adet: {quantity}</span>}
            </p>
          </div>
          <Prices price={price} className="mt-1" contentClass="text-sm font-bold" />
        </div>
      </div>

      {(totalItems || cartTotal) && (
        <div className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 dark:bg-neutral-700/50">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500">Sepetinizde {totalItems || 0} ürün</span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100">₺{(cartTotal || 0).toLocaleString('tr-TR')}</span>
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href="/cart" className="flex items-center justify-center rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-700">
          Sepeti Gör
        </Link>
        <Link href="/checkout" className="flex items-center justify-center rounded-full bg-primary-700 px-4 py-2 text-xs font-medium text-white hover:bg-primary-800">
          Ödemeye Geç
        </Link>
      </div>
    </Transition>
  )
}

interface AddToCardButtonProps {
  className?: string
  children?: React.ReactNode
  imageUrl: string
  title: string
  quantity: number
  size?: string
  color?: string
  price: number
  handle?: string
  productId?: string
  variantId?: string
  as?: ElementType | ComponentType<any>
  [key: string]: any
}

const AddToCardButton = ({
  children,
  className,
  color,
  imageUrl,
  price,
  quantity,
  size,
  title,
  handle,
  productId,
  variantId,
  as,
  ...props
}: AddToCardButtonProps) => {
  const { addItem, totalQuantity, subtotal } = useCart()

  const notifyAddTocart = () => {
    // Add to cart context (persisted in localStorage)
    addItem({
      productId: productId || handle || title,
      name: title,
      handle: handle || '',
      price,
      quantity: quantity || 1,
      image: imageUrl,
      size,
      color,
      variantId,
    })

    const newTotal = subtotal + price * (quantity || 1)
    const newCount = totalQuantity + (quantity || 1)

    toast.custom(
      (t) => (
        <NotifyAddToCart
          show={t.visible}
          imageUrl={imageUrl}
          quantity={quantity || 1}
          size={size}
          color={color}
          title={title}
          price={price}
          totalItems={newCount}
          cartTotal={newTotal}
        />
      ),
      { position: 'top-right', id: 'nc-product-notify', duration: 4000 }
    )
  }

  const Component = as || 'button'

  return (
    <Component className={className} onClick={notifyAddTocart} {...props}>
      {children}
    </Component>
  )
}

export default AddToCardButton
