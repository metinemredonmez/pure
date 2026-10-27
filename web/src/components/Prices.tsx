import clsx from 'clsx'
import { FC } from 'react'

export interface PricesProps {
  className?: string
  price: number
  /** İndirim öncesi fiyat (admin "Karşılaştırma Fiyatı"). Fiyattan büyükse üstü çizili gösterilir. */
  compareAtPrice?: number | null
  contentClass?: string
}

const formatTRY = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n)

const Prices: FC<PricesProps> = ({ className, price, compareAtPrice, contentClass = 'text-base' }) => {
  const oldPrice = Number(compareAtPrice) || 0
  const hasDiscount = oldPrice > price && price > 0
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0

  return (
    <div className={clsx('flex flex-wrap items-center gap-x-2 gap-y-1', className)}>
      {hasDiscount && (
        <span className="text-sm leading-none! font-medium text-neutral-400 line-through dark:text-neutral-500">
          {formatTRY(oldPrice)}
        </span>
      )}
      <span className={clsx('leading-none! font-bold text-neutral-900 dark:text-white', contentClass)}>
        {formatTRY(price)}
      </span>
      {hasDiscount && discountPercent > 0 && (
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs leading-none! font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
          %{discountPercent} İndirim
        </span>
      )}
    </div>
  )
}

export default Prices
