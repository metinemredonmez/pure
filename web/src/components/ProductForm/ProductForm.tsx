'use client'

import { NotifyAddToCart } from '@/components/AddToCardButton'
import { useCart } from '@/contexts/CartContext'
import { useTranslation } from '@/contexts/LanguageContext'
import { TProductDetail } from '@/data/data'
import Form from 'next/form'
import React from 'react'
import toast from 'react-hot-toast'

const ProductForm = ({
  children,
  className,
  product,
}: {
  children?: React.ReactNode
  className?: string
  product: TProductDetail
}) => {
  const { addItem, totalQuantity, subtotal } = useCart()
  const { t } = useTranslation()
  const { featuredImage, title, price, id, handle } = product as TProductDetail & {
    id?: string
    handle?: string
  }

  const onFormSubmit = async (formData: FormData) => {
    const quantity = formData.get('quantity') ? Number(formData.get('quantity')) : 1
    const size = formData.get('size') ? String(formData.get('size')) : ''
    const color = formData.get('color') ? String(formData.get('color')) : ''
    const productId = id || handle || title || 'product'
    const productHandle = handle || ''
    const variantId = [size, color].filter(Boolean).join('__') || undefined
    const productName = title || t('common.product', 'Ürün')

    addItem({
      productId,
      name: productName,
      handle: productHandle,
      price: price || 0,
      quantity,
      image: featuredImage?.src || '',
      size,
      color,
      variantId,
    })

    const newTotal = subtotal + (price || 0) * quantity
    const newCount = totalQuantity + quantity

    toast.custom(
      (t) => (
        <NotifyAddToCart
          show={t.visible}
          imageUrl={featuredImage?.src || ''}
          quantity={quantity}
          size={size}
          color={color}
          title={productName}
          price={price || 0}
          totalItems={newCount}
          cartTotal={newTotal}
        />
      ),
      { position: 'top-right', id: 'nc-product-notify', duration: 4000 }
    )
  }

  return (
    <Form action={onFormSubmit} className={className}>
      {children}
    </Form>
  )
}

export default ProductForm
