import { DiscountTag01Icon, PackageIcon, DeliveryTruck01Icon, CoffeeIcon, Invoice01Icon, ColorsIcon, GiftCardIcon, GiftIcon, CallIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import Image from 'next/image'
import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'Kurumsal Hediye',
  description: 'Pure Olentia kurumsal hediye paketleri. Çalışanlarınıza, müşterilerinize özel kahve hediyesi.',
}

const giftSets = [
  {
    name: 'Klasik Set',
    desc: 'Türk Kahvesi 100gr + bakır cezve + porselen fincan takımı',
    price: '₺349',
    icon: <HugeiconsIcon icon={CoffeeIcon} size={28} color="currentColor" strokeWidth={1.5} />,
    accent: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
  },
  {
    name: 'Premium Set',
    desc: '3 farklı menşei kahve (250gr x 3) + demleme rehberi + özel kutu',
    price: '₺549',
    icon: <HugeiconsIcon icon={GiftIcon} size={28} color="currentColor" strokeWidth={1.5} />,
    accent: 'from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20',
    popular: true,
  },
  {
    name: 'Gourmet Set',
    desc: 'Signature Blend 500gr + V60 starter kit + workshop davetiyesi',
    price: '₺899',
    icon: <HugeiconsIcon icon={GiftCardIcon} size={28} color="currentColor" strokeWidth={1.5} />,
    accent: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
  },
  {
    name: 'Özel Tasarım',
    desc: 'Tamamen size özel: logo baskı, özel blend, kişiye özel not kartı',
    price: 'Teklif alın',
    icon: <HugeiconsIcon icon={ColorsIcon} size={28} color="currentColor" strokeWidth={1.5} />,
    accent: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
  },
]

const benefits = [
  { icon: <HugeiconsIcon icon={DiscountTag01Icon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Logonuzla Markalama', desc: 'Kutu, ambalaj ve not kartı üzerine şirket logonuz basılır.' },
  { icon: <HugeiconsIcon icon={PackageIcon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Toplu Sipariş Avantajı', desc: '20+ adet siparişlerde özel toplu indirim.' },
  { icon: <HugeiconsIcon icon={DeliveryTruck01Icon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Türkiye Geneli Teslimat', desc: 'Tek adrese veya farklı adreslere çoklu gönderim.' },
  { icon: <HugeiconsIcon icon={CoffeeIcon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Taze Kavurma Garantisi', desc: 'Hediye tarihinize göre sipariş üzerine taze kavrulur.' },
  { icon: <HugeiconsIcon icon={Invoice01Icon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Kişiye Özel Not Kartı', desc: 'Her pakete el yazısı veya baskılı tebrik kartı eklenir.' },
  { icon: <HugeiconsIcon icon={ColorsIcon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Özel Kutu Tasarımı', desc: 'Etkinlik temanıza veya markanıza uygun kutu tasarımı.' },
]

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Kurumsal Hediye</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir. Eğer içerik görünmüyorsa lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="kurumsal-hediye" kicker="Kurumsal" fallback={<Fallback />} />
}
