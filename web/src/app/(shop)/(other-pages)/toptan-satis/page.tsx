import { CoffeeIcon, Hotel01Icon, Building02Icon, ShoppingCart01Icon, CallIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import Image from 'next/image'
import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'Toptan Satış',
  description: 'Pure Olentia toptan kahve satış bilgileri. Kafeler, oteller, restoranlar için özel fiyat.',
}

const segments = [
  {
    icon: <HugeiconsIcon icon={CoffeeIcon} size={28} color="currentColor" strokeWidth={1.5} />,
    title: 'Kafeler & Specialty Barlar',
    desc: 'Menünüze özel blend geliştirme, barista eğitimi ve ekipman danışmanlığı dahil.',
    minOrder: '10 kg/ay',
  },
  {
    icon: <HugeiconsIcon icon={Hotel01Icon} size={28} color="currentColor" strokeWidth={1.5} />,
    title: 'Oteller & Restoranlar',
    desc: 'Kahvaltı servisi, oda servisi ve lobi kahve istasyonları için düzenli tedarik.',
    minOrder: '25 kg/ay',
  },
  {
    icon: <HugeiconsIcon icon={Building02Icon} size={28} color="currentColor" strokeWidth={1.5} />,
    title: 'Ofisler & Co-working',
    desc: 'Çalışan memnuniyetini artıran premium kahve aboneliği. Otomatik teslimat.',
    minOrder: '5 kg/ay',
  },
  {
    icon: <HugeiconsIcon icon={ShoppingCart01Icon} size={28} color="currentColor" strokeWidth={1.5} />,
    title: 'Perakende & Market',
    desc: 'Raf ürünü olarak Pure Olentia kahveleri. Markalama ve fiyatlandırma desteği.',
    minOrder: '50 kg/sipariş',
  },
]

const advantages = [
  { value: '%30\'a kadar', label: 'Toplu İndirim', desc: 'Hacme göre kademeli fiyat avantajı' },
  { value: '24 saat', label: 'Taze Kavurma', desc: 'Sipariş üzerine kavrulur, bayatlık olmaz' },
  { value: 'Ücretsiz', label: 'Kargo', desc: 'Tüm toptan siparişlerde ücretsiz gönderim' },
  { value: '7/24', label: 'Destek', desc: 'Özel müşteri temsilciniz her zaman yanınızda' },
]

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Toptan Satış</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir. Eğer içerik görünmüyorsa lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="toptan-satis" kicker="Kurumsal" fallback={<Fallback />} />
}
