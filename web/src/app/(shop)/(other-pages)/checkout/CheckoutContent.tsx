'use client'

import { useCart } from '@/contexts/CartContext'
import Prices from '@/components/Prices'
import Breadcrumb from '@/shared/Breadcrumb'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Coffee01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import Information from './Information'

export default function CheckoutContent() {
  const { items, subtotal, removeItem, updateQuantity, isHydrated } = useCart()

  const freeShippingThreshold = 300
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 29.90
  const kdvRate = 0.10
  const kdvAmount = subtotal * kdvRate
  const total = subtotal + shippingCost + kdvAmount

  if (!isHydrated) {
    return <main className="container py-16 lg:pt-20 lg:pb-28"><div className="py-20 text-center text-neutral-400">Yükleniyor...</div></main>
  }

  if (items.length === 0) {
    return (
      <main className="container py-16 lg:pt-20 lg:pb-28">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <HugeiconsIcon icon={Coffee01Icon} size={36} color="currentColor" strokeWidth={1.5} className="text-neutral-400" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">Sepetiniz boş</h3>
          <p className="mt-2 text-sm text-neutral-500">Ödeme yapabilmek için sepetinize ürün ekleyin.</p>
          <Link href="/collections/all" className="mt-6 rounded-full bg-primary-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-800">
            Alışverişe Başla
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-16 lg:pt-20 lg:pb-28">
      <div className="mb-16">
        <h1 className="mb-5 block text-3xl font-semibold lg:text-4xl">Ödeme</h1>
        <Breadcrumb
          breadcrumbs={[
            { id: 1, name: 'Ana Sayfa', href: '/' },
            { id: 2, name: 'Sepet', href: '/cart' },
          ]}
          currentPage="Ödeme"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1">
          <Information />
        </div>

        <div className="my-10 shrink-0 border-t lg:mx-10 lg:my-0 lg:border-t-0 lg:border-l xl:lg:mx-14 2xl:mx-16" />

        <div className="w-full lg:w-[36%]">
          <h3 className="text-lg font-semibold">Sipariş Özeti</h3>
          <div className="mt-8 divide-y divide-neutral-200/70 dark:divide-neutral-700">
            {items.map((item) => (
              <div key={item.id} className="flex py-5 first:pt-0 last:pb-0">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  {item.image ? (
                    <Image fill src={item.image} alt={item.name} sizes="100px" className="object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <HugeiconsIcon icon={Coffee01Icon} size={24} color="currentColor" strokeWidth={1.5} className="text-neutral-300" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-1 flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{item.name}</h4>
                      {item.size && <p className="mt-0.5 text-xs text-neutral-500">{item.size}</p>}
                    </div>
                    <Prices price={item.price} className="mt-0.5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">-</button>
                      <span className="text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-xs font-medium text-red-500">Kaldır</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-neutral-200/70 pt-6 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            <div className="flex justify-between py-2.5">
              <span>Ara Toplam</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                ₺{subtotal.toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span>Kargo</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                {shippingCost === 0 ? <span className="text-green-600">Ücretsiz</span> : `₺${shippingCost.toLocaleString('tr-TR')}`}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span>KDV (%{(kdvRate * 100).toFixed(0)})</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                ₺{kdvAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between pt-4 text-base font-semibold text-neutral-900 dark:text-neutral-200">
              <span>Toplam</span>
              <span>₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <ButtonPrimary className="mt-8 w-full">
            Siparişi Onayla
          </ButtonPrimary>
          <p className="mt-4 text-center text-xs text-neutral-400">
            ₺{freeShippingThreshold} üzeri siparişlerde ücretsiz kargo
          </p>
        </div>
      </div>
    </main>
  )
}
