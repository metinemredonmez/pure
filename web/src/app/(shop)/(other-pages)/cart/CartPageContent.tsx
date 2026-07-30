'use client'

import { useCart } from '@/contexts/CartContext'
import { useTranslation } from '@/contexts/LanguageContext'
import { getApiSiteSettings } from '@/lib/api'
import Breadcrumb from '@/shared/Breadcrumb'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { CheckIcon } from '@heroicons/react/24/outline'
import { Coffee01Icon, PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartPageContent() {
  const { items, subtotal, removeItem, updateQuantity, isHydrated } = useCart()
  const { t } = useTranslation()

  // Admin → Ayarlar'dan KDV oranı (% cinsinden), ücretsiz kargo eşiği ve kargo ücreti
  const [kdvRate, setKdvRate] = useState(0.10)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(300)
  const [shippingFee, setShippingFee] = useState(29.90)
  useEffect(() => {
    getApiSiteSettings().then((res: any) => {
      const data = res?.data || res || {}
      // taxRate admin'de "% cinsinden" (örn 1, 10, 18, 20). 0–100 arası beklenir.
      const tax = Number(data.taxRate)
      if (Number.isFinite(tax) && tax >= 0 && tax <= 100) setKdvRate(tax / 100)
      const fst = Number(data.freeShippingThreshold)
      if (Number.isFinite(fst) && fst >= 0) setFreeShippingThreshold(fst)
      const sc = Number(data.shippingCost)
      if (Number.isFinite(sc) && sc >= 0) setShippingFee(sc)
    }).catch(() => {})
  }, [])

  const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingFee
  // Fiyatlar KDV DAHİL: KDV üstüne eklenmez, fiyatın içindeki KDV tutarı gösterilir.
  const kdvAmount = subtotal - subtotal / (1 + kdvRate)
  const total = subtotal + shippingCost

  if (!isHydrated) {
    return (
      <div className="nc-CartPage">
        <main className="container py-16 lg:pt-20 lg:pb-28">
          <h2 className="block text-2xl font-semibold sm:text-3xl lg:text-4xl">{t('cart.title', 'Alışveriş Sepeti')}</h2>
          <div className="py-20 text-center text-neutral-400">{t('common.loading', 'Yükleniyor...')}</div>
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="nc-CartPage">
        <main className="container py-16 lg:pt-20 lg:pb-28">
          <h2 className="block text-2xl font-semibold sm:text-3xl lg:text-4xl">{t('cart.title', 'Alışveriş Sepeti')}</h2>
          <div className="mt-20 flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <HugeiconsIcon icon={PackageIcon} size={40} color="currentColor" strokeWidth={1.5} className="text-neutral-400" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">{t('cart.empty', 'Sepetiniz boş')}</h3>
            <p className="mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
              {t('cart.empty_desc', 'Henüz sepetinize ürün eklemediniz. Kahvelerimizi keşfetmeye başlayın!')}
            </p>
            <ButtonPrimary href="/collections/all" className="mt-8">
              {t('cart.explore_coffees', 'Kahveleri Keşfet')}
            </ButtonPrimary>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="nc-CartPage">
      <main className="container py-16 lg:pt-20 lg:pb-28">
        <div className="mb-12 sm:mb-16">
          <h2 className="block text-2xl font-semibold sm:text-3xl lg:text-4xl">{t('cart.title', 'Alışveriş Sepeti')}</h2>
          <Breadcrumb breadcrumbs={[{ id: 1, name: t('nav.home', 'Ana Sayfa'), href: '/' }]} currentPage={t('cart.title', 'Alışveriş Sepeti')} className="mt-5" />
        </div>

        <hr className="my-10 border-neutral-200 xl:my-12 dark:border-neutral-700" />

        <div className="flex flex-col lg:flex-row">
          <div className="w-full divide-y divide-neutral-200 lg:w-[60%] xl:w-[55%] dark:divide-neutral-700">
            {items.map((item) => (
              <div key={item.id} className="relative flex py-8 first:pt-0 last:pb-0 sm:py-10 xl:py-12">
                <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-32">
                  {item.image && (
                    <Image
                      fill
                      src={item.image}
                      alt={item.name}
                      sizes="300px"
                      className="rounded-xl object-contain object-center"
                    />
                  )}
                  {!item.image && (
                    <div className="flex h-full w-full items-center justify-center">
                      <HugeiconsIcon icon={Coffee01Icon} size={32} color="currentColor" strokeWidth={1.5} className="text-neutral-300" />
                    </div>
                  )}
                  <Link href={'/products/' + item.handle} className="absolute inset-0"></Link>
                </div>

                <div className="ml-3 flex flex-1 flex-col sm:ml-6">
                  <div>
                    <div className="flex justify-between">
                      <div className="flex-[1.5]">
                        <h3 className="text-base font-semibold">
                          <Link href={'/products/' + item.handle}>{item.name}</Link>
                        </h3>
                        {(item.size || item.grind || item.color) && (
                          <div className="mt-1.5 flex text-sm text-neutral-500 dark:text-neutral-400">
                            <span>{[item.size, item.grind, item.color].filter(Boolean).join(' · ')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
                        >
                          +
                        </button>
                      </div>

                      <div className="hidden flex-1 justify-end sm:flex">
                        <span className="rounded-lg border border-primary-500 px-2.5 py-1 text-sm font-semibold text-primary-600">
                          ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-4 text-sm">
                    <div className="flex items-center justify-center rounded-full border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                      <CheckIcon className="h-3.5 w-3.5" />
                      <span className="ml-1 leading-none">{t('product.in_stock', 'Stokta')}</span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm font-medium text-red-500 hover:text-red-600"
                    >
                      {t('common.remove', 'Kaldır')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="my-10 shrink-0 border-t border-neutral-200 lg:mx-10 lg:my-0 lg:border-t-0 lg:border-l xl:mx-16 2xl:mx-20 dark:border-neutral-700"></div>

          <div className="flex-1">
            <div className="sticky top-10">
              <h3 className="text-lg font-semibold">{t('cart.order_summary', 'Sipariş Özeti')}</h3>
              <div className="mt-7 divide-y divide-neutral-200/70 text-sm text-neutral-500 dark:divide-neutral-700/80 dark:text-neutral-400">
                <div className="flex justify-between pb-4">
                  <span>{t('cart.subtotal', 'Ara Toplam')}</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    ₺{subtotal.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between py-4">
                  <span>{t('cart.shipping', 'Kargo')}</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">{t('cart.free', 'Ücretsiz')}</span>
                    ) : (
                      `₺${shippingCost.toLocaleString('tr-TR')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-4">
                  <span>{t('cart.vat_included', 'KDV (%{rate} dahil)', { rate: (kdvRate * 100).toFixed(0) })}</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    ₺{kdvAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {subtotal < freeShippingThreshold && (
                  <div className="py-3 text-xs text-primary-600">
                    {t('cart.free_shipping_hint', '₺{amount} daha ekleyin, ücretsiz kargo kazanın!', { amount: (freeShippingThreshold - subtotal).toLocaleString('tr-TR') })}
                  </div>
                )}
                <div className="flex justify-between pt-4 text-base font-semibold text-neutral-900 dark:text-neutral-200">
                  <span>{t('cart.total', 'Toplam')}</span>
                  <span>₺{total.toLocaleString('tr-TR')}</span>
                </div>
              </div>
              <ButtonPrimary href="/checkout" className="mt-8 w-full">
                {t('common.checkout', 'Ödemeye Geç')}
              </ButtonPrimary>
              <p className="mt-4 text-center text-xs text-neutral-400">
                {t('cart.free_shipping_over', '₺{amount} üzeri siparişlerde ücretsiz kargo', { amount: freeShippingThreshold })}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
