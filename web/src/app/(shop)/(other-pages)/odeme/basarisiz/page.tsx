import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonThird from '@/shared/Button/ButtonThird'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Odeme Basarisiz',
  description: 'PayTR odeme islemi tamamlanamadi.',
}

export default function PaymentFailedPage() {
  return (
    <main className="container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl font-semibold text-amber-700">
          !
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Odeme Tamamlanamadi
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-900">
          Islem yarida kaldi veya banka tarafindan reddedildi
        </h1>
        <p className="mt-4 text-sm leading-6 text-neutral-600">
          Kartinizdan para cekilmediyse checkout ekranina donup tekrar deneyin. Sorun
          devam ederse banka hareketlerinizi kontrol edin ve bizimle iletisime gecin.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <ButtonPrimary href="/checkout" className="w-full">
            Tekrar Dene
          </ButtonPrimary>
          <ButtonThird href="/odeme-teslimat" className="w-full">
            Odeme Bilgileri
          </ButtonThird>
        </div>
      </div>
    </main>
  )
}
