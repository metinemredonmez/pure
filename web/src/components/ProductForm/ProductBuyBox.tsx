'use client'

import { NotifyAddToCart } from '@/components/AddToCardButton'
import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import { useCart } from '@/contexts/CartContext'
import { TProductDetail } from '@/data/data'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'
import toast from 'react-hot-toast'

const ROAST_LABELS: Record<string, string> = {
  'acik kavurma': 'Açık Kavurma',
  'açık kavurma': 'Açık Kavurma',
  'orta kavurma': 'Orta Kavurma',
  'koyu kavurma': 'Koyu Kavurma',
}

type GramajValue = { name: string; priceAmount?: number; variantId?: string; weight?: number }

const fmt = (n: number) => `₺${Number(n || 0).toFixed(0)}`

export default function ProductBuyBox({ product }: { product: TProductDetail }) {
  const { addItem, totalQuantity, subtotal } = useCart()
  const p = product as any

  const featuredImage = p.featuredImage
  const title = (p.title as string) || 'Ürün'
  const basePrice = Number(p.price) || 0

  const variants = (p.variants || []) as any[]
  const kavurmaValues = (p.options?.find((o: any) => o.name === 'Kavurma')?.optionValues || []) as any[]
  const grindValues = (p.options?.find((o: any) => o.name === 'Öğütme')?.optionValues || []) as any[]
  const gramajValues = (p.options?.find((o: any) => o.name === 'Gramaj')?.optionValues || []) as GramajValue[]

  const [color, setColor] = useState<string>(kavurmaValues[0]?.name || '')
  const [grind, setGrind] = useState<string>(grindValues[0]?.value || '')
  const [size, setSize] = useState<string>(gramajValues[0]?.name || '')
  const [quantity, setQuantity] = useState<number>(1)

  const activeGramaj = gramajValues.find((g) => g.name === size)
  const selectedWeight = activeGramaj?.weight
  // (öğütme + gramaj) kombinasyonuna göre doğru varyant → fiyatı ondan al
  const activeVariant =
    variants.find(
      (v) =>
        (!grind || v.grindType === grind) &&
        (selectedWeight == null || Number(v.weight) === selectedWeight),
    ) ||
    (selectedWeight != null
      ? variants.find((v) => Number(v.weight) === selectedWeight)
      : undefined) ||
    null
  const variantPrice = activeVariant ? parseFloat(activeVariant.price) : 0
  const activePrice =
    variantPrice > 0
      ? variantPrice
      : activeGramaj?.priceAmount && activeGramaj.priceAmount > 0
        ? activeGramaj.priceAmount
        : basePrice
  const activeVariantId = activeVariant?.id || activeGramaj?.variantId

  const handleAdd = () => {
    addItem({
      productId: p.id || p.handle || title,
      name: title,
      handle: p.handle || '',
      price: activePrice,
      quantity,
      image: featuredImage?.src || '',
      size,
      color,
      variantId: activeVariantId || [size, color].filter(Boolean).join('__') || undefined,
    })

    const newTotal = subtotal + activePrice * quantity
    const newCount = totalQuantity + quantity
    toast.custom(
      (t) => (
        <NotifyAddToCart
          show={t.visible}
          imageUrl={featuredImage?.src || ''}
          quantity={quantity}
          size={size}
          color={color}
          title={title}
          price={activePrice}
          totalItems={newCount}
          cartTotal={newTotal}
        />
      ),
      { position: 'top-right', id: 'nc-product-notify', duration: 4000 }
    )
  }

  return (
    <div className="flex flex-col gap-y-8">
      {/* Fiyat — seçili gramaja göre güncellenir */}
      <div className="flex items-center gap-x-3">
        <Prices contentClass="py-1.5 px-3 text-xl font-semibold" price={activePrice} />
        {gramajValues.length > 0 && activeGramaj?.name && (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">/ {activeGramaj.name}</span>
        )}
      </div>

      {/* Kavurma Profili */}
      {kavurmaValues.length > 0 && (
        <Headless.Field>
          <Headless.RadioGroup value={color} onChange={setColor} aria-label="Kavurma Profili">
            <Headless.Label className="block text-sm font-medium">Kavurma Profili</Headless.Label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {kavurmaValues.map((v) => {
                const isActive = v.name === color
                const label = ROAST_LABELS[String(v.name).toLowerCase()] || v.name
                return (
                  <Headless.Radio
                    key={v.name}
                    value={v.name}
                    as="button"
                    type="button"
                    className={clsx(
                      'rounded-full border px-4 py-2 text-sm font-medium transition',
                      isActive
                        ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    {label}
                  </Headless.Radio>
                )
              })}
            </div>
          </Headless.RadioGroup>
        </Headless.Field>
      )}

      {/* Öğütme */}
      {grindValues.length > 0 && (
        <Headless.Field>
          <Headless.RadioGroup value={grind} onChange={setGrind} aria-label="Öğütme">
            <Headless.Label className="block text-sm font-medium">Öğütme</Headless.Label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {grindValues.map((g) => {
                const isActive = g.value === grind
                return (
                  <Headless.Radio
                    key={g.value}
                    value={g.value}
                    as="button"
                    type="button"
                    className={clsx(
                      'rounded-full border px-4 py-2 text-sm font-medium transition',
                      isActive
                        ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    {g.name}
                  </Headless.Radio>
                )
              })}
            </div>
          </Headless.RadioGroup>
        </Headless.Field>
      )}

      {/* Gramaj — fiyatlı */}
      {gramajValues.length > 0 && (
        <Headless.Field>
          <Headless.RadioGroup value={size} onChange={setSize} aria-label="Gramaj">
            <Headless.Label className="block text-sm font-medium">Gramaj</Headless.Label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {gramajValues.map((g) => {
                const isActive = g.name === size
                return (
                  <Headless.Radio
                    key={g.name}
                    value={g.name}
                    as="button"
                    type="button"
                    className={clsx(
                      'flex min-w-20 flex-col items-center rounded-xl border px-4 py-2 text-sm font-medium transition',
                      isActive
                        ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    <span>{g.name}</span>
                    {grindValues.length === 0 && g.priceAmount ? (
                      <span className="text-xs opacity-80">{fmt(g.priceAmount)}</span>
                    ) : null}
                  </Headless.Radio>
                )
              })}
            </div>
          </Headless.RadioGroup>
        </Headless.Field>
      )}

      {/* Adet + Sepete Ekle */}
      <div className="flex gap-x-3.5">
        <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
          <NcInputNumber defaultValue={1} onChange={setQuantity} />
        </div>
        <ButtonPrimary className="flex-1" type="button" onClick={handleAdd}>
          <HugeiconsIcon
            icon={ShoppingBag03Icon}
            size={20}
            color="currentColor"
            className="hidden sm:block"
            strokeWidth={1.5}
          />
          <span className="text-base/6 font-normal sm:ml-2.5">Sepete Ekle</span>
        </ButtonPrimary>
      </div>
    </div>
  )
}
