import { Award01Icon, Coffee01Icon, GiftIcon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
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

export default function SadakatPage() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-amber-900 to-primary-950">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 400 200" fill="none">
            <circle cx="350" cy="30" r="120" fill="white" />
            <circle cx="50" cy="170" r="80" fill="white" />
          </svg>
        </div>
        <div className="container relative py-20 text-center text-white lg:py-28">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
            Sadakat Programı
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Her Yudumda <br /> Kazanın
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Pure Olentia sadakat programı ile her alışverişinizde puan kazanın, özel indirimlerden
            ve ayrıcalıklı fırsatlardan yararlanın.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary-800 shadow-lg transition hover:bg-neutral-100">
              Hemen Katıl
            </Link>
            <Link href="/login" className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="container -mt-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {howItWorks.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 text-center shadow-lg dark:bg-neutral-800">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/30">
                <HugeiconsIcon icon={item.icon} size={24} color="currentColor" strokeWidth={1.5} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-neutral-900 dark:text-white">{item.title}</h3>
              <p className="mt-1 text-xs text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tiers */}
      <div className="container mt-24">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Seviye Dağılımı & Avantajlar</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-500 dark:text-neutral-400">
          Her seviyenin kendine özel avantajları vardır. Puanlarınız 12 ay geçerlidir.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {tiers.map((tier, i) => (
            <div key={i} className={`group rounded-2xl border ${tier.borderColor} ${tier.bgLight} p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg`}>
              <div className="text-4xl">{tier.emoji}</div>
              <h3 className="mt-3 text-lg font-bold text-neutral-900 dark:text-white">{tier.name}</h3>
              <p className="mt-1 text-xs font-medium text-neutral-500">{tier.points}</p>
              <div className="mt-4 space-y-2">
                {tier.benefits.map((b, j) => (
                  <div key={j} className="rounded-lg bg-white/60 px-3 py-1.5 text-xs text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                    {b}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Puan hesaplama */}
      <div className="container mt-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-primary-800 via-amber-900 to-primary-950 p-8 text-white sm:p-12">
          <h2 className="text-center text-2xl font-bold">Nasıl Puan Kazanırsınız?</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="text-2xl font-bold">1 TL = 1 Puan</div>
              <p className="mt-2 text-sm text-white/70">Her alışverişinizde harcadığınız her 1 TL için 1 puan kazanırsınız.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="text-2xl font-bold">100 Puan = ₺10</div>
              <p className="mt-2 text-sm text-white/70">Biriktirdiğiniz 100 puanı ₺10 indirim kuponu olarak kullanabilirsiniz.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="text-2xl font-bold">2x Puan Günleri</div>
              <p className="mt-2 text-sm text-white/70">Özel kampanya günlerinde çift puan kazanma fırsatı.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="text-2xl font-bold">Referans Bonusu</div>
              <p className="mt-2 text-sm text-white/70">Arkadaşınızı davet edin, ilk siparişinde siz de 50 bonus puan kazanın.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mt-24 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Hemen Başlayın</h2>
        <p className="mx-auto mt-3 max-w-lg text-neutral-500 dark:text-neutral-400">
          Ücretsiz üye olun ve ilk alışverişinizde puan kazanmaya başlayın.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-primary-700 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-800">
            Ücretsiz Üye Ol
          </Link>
          <Link href="/collections/all" className="flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    </div>
  )
}
