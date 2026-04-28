import { CreditCardIcon, Invoice01Icon, SmartPhone01Icon, Shield01Icon, Building01Icon, Globe02Icon, Location01Icon, ShoppingCart01Icon, Coffee01Icon, PackageIcon, DeliveryTruck01Icon, BulbIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'Ödeme & Teslimat',
  description: 'Pure Olentia ödeme yöntemleri ve kargo/teslimat bilgileri.',
}

const paymentMethods = [
  { icon: <HugeiconsIcon icon={CreditCardIcon} size={28} color="currentColor" strokeWidth={1.5} />, name: 'Kredi / Banka Kartı', desc: 'Visa, Mastercard, Troy ile güvenli ödeme. Taksit seçenekleri mevcut.' },
  { icon: <HugeiconsIcon icon={Invoice01Icon} size={28} color="currentColor" strokeWidth={1.5} />, name: 'Havale / EFT', desc: 'Sipariş onayından sonra 24 saat içinde ödemenizi yapın.' },
  { icon: <HugeiconsIcon icon={SmartPhone01Icon} size={28} color="currentColor" strokeWidth={1.5} />, name: 'Mobil Ödeme', desc: 'Apple Pay ve Google Pay ile hızlı ödeme.' },
]

const shippingZones = [
  { zone: 'İstanbul İçi', time: '1 iş günü', icon: <HugeiconsIcon icon={Building01Icon} size={28} color="currentColor" strokeWidth={1.5} /> },
  { zone: 'Büyükşehirler', time: '1-2 iş günü', icon: <HugeiconsIcon icon={Globe02Icon} size={28} color="currentColor" strokeWidth={1.5} /> },
  { zone: 'Diğer İller', time: '2-3 iş günü', icon: <HugeiconsIcon icon={Location01Icon} size={28} color="currentColor" strokeWidth={1.5} /> },
]

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Ödeme & Teslimat</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir. Eğer içerik görünmüyorsa lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="odeme-teslimat" kicker="Müşteri Hizmetleri" fallback={<Fallback />} />
}
