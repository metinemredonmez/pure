import { Award01Icon, Coffee01Icon, GiftIcon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sadakat Programı',
  description: 'Pure Olentia sadakat programı. Her alışverişte puan kazanın, özel indirimler ve hediyeler kazanın.',
}

const tiers = [
  {
    name: 'Bronz',
    emoji: '🥉',
    points: 'Başlangıç',
    color: 'from-amber-700 to-amber-800',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    benefits: ['%5 indirim', 'Doğum günü sürprizi'],
  },
  {
    name: 'Gümüş',
    emoji: '🥈',
    points: '500+ puan',
    color: 'from-neutral-400 to-neutral-500',
    bgLight: 'bg-neutral-100 dark:bg-neutral-800',
    borderColor: 'border-neutral-300 dark:border-neutral-700',
    benefits: ['%10 indirim', 'Ücretsiz kargo', 'Erken erişim'],
  },
  {
    name: 'Altın',
    emoji: '🥇',
    points: '2.000+ puan',
    color: 'from-yellow-500 to-amber-600',
    bgLight: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    benefits: ['%15 indirim', 'Öncelikli kargo', 'Özel kampanyalar', 'Ücretsiz numune'],
  },
  {
    name: 'Platin',
    emoji: '💎',
    points: '5.000+ puan',
    color: 'from-sky-400 to-blue-600',
    bgLight: 'bg-sky-50 dark:bg-sky-900/20',
    borderColor: 'border-sky-300 dark:border-sky-700',
    benefits: ['%20 indirim', 'Özel ürünler', 'Kişisel barista danışmanlığı', 'VIP etkinlikler'],
  },
  {
    name: 'Elmas',
    emoji: '👑',
    points: '10.000+ puan',
    color: 'from-purple-500 to-indigo-600',
    bgLight: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
    benefits: ['%25 indirim', 'VIP erişim', 'Özel blend oluşturma', 'Yıllık hediye paketi', 'Fabrika turu'],
  },
]

const howItWorks = [
  {
    icon: ShoppingCart01Icon,
    title: 'Alışveriş Yapın',
    desc: 'Her 1 TL harcama = 1 puan kazanın',
  },
  {
    icon: Award01Icon,
    title: 'Seviye Atlayın',
    desc: 'Puan biriktirdikçe seviyeniz yükselir',
  },
  {
    icon: GiftIcon,
    title: 'Ödüller Kazanın',
    desc: 'İndirimler, ücretsiz kargo ve özel hediyeler',
  },
  {
    icon: Coffee01Icon,
    title: 'Puanlarınızı Kullanın',
    desc: 'Puanlarınızı indirim kuponu olarak harcayın',
  },
]

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Sadakat Programı</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir. Eğer içerik görünmüyorsa lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="sadakat" kicker="Üyelik" fallback={<Fallback />} />
}
