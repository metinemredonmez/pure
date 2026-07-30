import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonThird from '@/shared/Button/ButtonThird'
import { Metadata } from 'next'
import ClearCartOnSuccess from './ClearCartOnSuccess'

export const metadata: Metadata = {
  title: 'Odeme Basarili',
  description: 'PayTR odemeniz basariyla tamamlandi.',
}

export default function PaymentSuccessPage() {
  return (
    <main className="container py-16 lg:py-24">
      {/* Ödeme başarıyla döndü — sepet yalnızca burada temizlenir */}
      <ClearCartOnSuccess />
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-700">
          +
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Odeme Alindi
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-900">
          Siparisiniz basariyla olusturuldu
        </h1>
        <p className="mt-4 text-sm leading-6 text-neutral-600">
          Odemeniz onaylandiginda siparisiniz hazirlama surecine girer. Durumu hesap
          sayfanizdan veya siparis takibi ekranindan kontrol edebilirsiniz.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <ButtonPrimary href="/orders" className="w-full">
            Siparislerim
          </ButtonPrimary>
          <ButtonThird href="/collections/all" className="w-full">
            Alisverise Devam Et
          </ButtonThird>
        </div>
      </div>
    </main>
  )
}
