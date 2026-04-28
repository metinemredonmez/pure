import { Calendar01Icon, CoffeeIcon, Settings01Icon, ReturnRequestIcon, DeliveryTruck01Icon, CreditCardIcon, MailOpen01Icon, CheckmarkCircleIcon, PackageIcon, CreditCardPosIcon, AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'İade & Değişim',
  description: 'Pure Olentia iade ve değişim koşulları. Tüketici haklarınız kapsamında 14 gün içinde iade hakkı.',
}

const conditions = [
  { icon: <HugeiconsIcon icon={Calendar01Icon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'İade Süresi', desc: 'Ürünü teslim aldıktan sonra 14 gün içinde iade hakkınız vardır. Mesafeli Satış Sözleşmeleri Yönetmeliği ile güvence altındadır.', color: 'amber' },
  { icon: <HugeiconsIcon icon={CoffeeIcon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Kahve Ürünleri', desc: 'Ambalajı açılmamış, mühürü bozulmamış kavrulmuş kahve ürünleri iade edilebilir. Açılan paketler hijyen nedeniyle iade edilemez.', color: 'primary' },
  { icon: <HugeiconsIcon icon={Settings01Icon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Ekipmanlar', desc: 'Orijinal ambalajında, kullanılmamış, tüm aksesuarları tam olan ekipmanlar 14 gün içinde iade edilebilir.', color: 'sky' },
  { icon: <HugeiconsIcon icon={ReturnRequestIcon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Abonelikler', desc: 'Abonelik planlarınızı istediğiniz zaman hesap panelinizden iptal edebilirsiniz. İptal sonrası gönderilen sipariş iade edilebilir.', color: 'emerald' },
  { icon: <HugeiconsIcon icon={DeliveryTruck01Icon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Kargo Ücreti', desc: 'Hatalı gönderim veya üründe kusur varsa kargo Pure Olentia tarafından karşılanır. Cayma hakkında iade kargo müşteriye aittir.', color: 'rose' },
  { icon: <HugeiconsIcon icon={CreditCardIcon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Ücret İadesi', desc: 'Ürün tarafımıza ulaştıktan sonra 7 iş günü içinde ödeme yönteminize uygun şekilde ücret iadesi yapılır.', color: 'violet' },
]

const steps = [
  { no: '1', title: 'Bize Ulaşın', desc: 'İade talebinizi info@pureolentia.com adresine sipariş numaranızla iletin.', icon: <HugeiconsIcon icon={MailOpen01Icon} size={28} color="currentColor" strokeWidth={1.5} /> },
  { no: '2', title: 'Onay Alın', desc: 'Ekibimiz 24 saat içinde size dönüş yaparak iade kodunuzu paylaşır.', icon: <HugeiconsIcon icon={CheckmarkCircleIcon} size={28} color="currentColor" strokeWidth={1.5} /> },
  { no: '3', title: 'Kargoya Verin', desc: 'Ürünü orijinal ambalajında, iade kodu ile birlikte bize gönderin.', icon: <HugeiconsIcon icon={PackageIcon} size={28} color="currentColor" strokeWidth={1.5} /> },
  { no: '4', title: 'İade Tamamlandı', desc: 'Ürün ulaştıktan sonra 7 iş günü içinde ücretiniz iade edilir.', icon: <HugeiconsIcon icon={CreditCardPosIcon} size={28} color="currentColor" strokeWidth={1.5} /> },
]

const accentBg: Record<string, string> = {
  amber: 'bg-amber-50 dark:bg-amber-900/20',
  primary: 'bg-primary-50 dark:bg-primary-900/20',
  sky: 'bg-sky-50 dark:bg-sky-900/20',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
  rose: 'bg-rose-50 dark:bg-rose-900/20',
  violet: 'bg-violet-50 dark:bg-violet-900/20',
}

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">İade & Değişim</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir. Eğer içerik görünmüyorsa lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="iade-degisim" kicker="Müşteri Hizmetleri" fallback={<Fallback />} />
}
