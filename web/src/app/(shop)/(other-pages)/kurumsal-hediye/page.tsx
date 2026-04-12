import { DiscountTag01Icon, PackageIcon, DeliveryTruck01Icon, CoffeeIcon, Invoice01Icon, ColorsIcon, GiftCardIcon, GiftIcon, CallIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import Image from 'next/image'
import { Metadata } from 'next'

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

export default function KurumsalHediyePage() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero — full width with gradient + real product image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-neutral-900">
        <div className="container grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          {/* Left: Text */}
          <div className="text-white">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
              Kurumsal Hediye
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Unutulmaz Kahve <br /> Hediyeleri
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/70">
              Çalışanlarınız, müşterileriniz ve iş ortaklarınız için Pure Olentia'nın özel hediye paketleri.
              Taze kavrulmuş specialty kahve, özenle tasarlanmış kutularda.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-red-900 shadow-lg transition hover:bg-neutral-100">
                Teklif Alın
              </a>
              <a
                href="tel:+905524622954"
                className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <HugeiconsIcon icon={CallIcon} size={16} color="currentColor" strokeWidth={1.5} /> 0552 462 29 54
              </a>
            </div>
          </div>

          {/* Right: Product image */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src="/hero/hediye-paketi.jpg"
                alt="Pure Olentia Kurumsal Hediye Paketi"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white px-5 py-3 shadow-xl dark:bg-neutral-800">
              <div className="text-xs text-neutral-500">Minimum sipariş</div>
              <div className="text-lg font-bold text-red-800">20 adet</div>
            </div>
          </div>
        </div>

        {/* Decorative */}
        <div className="pointer-events-none absolute -top-20 -right-20 opacity-5 select-none"><HugeiconsIcon icon={GiftIcon} size={180} color="currentColor" strokeWidth={1} /></div>
      </div>

      {/* Benefits grid */}
      <div className="container mt-20">
        <h2 className="text-center text-3xl font-bold text-neutral-900 dark:text-white">Neden Pure Olentia?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-500 dark:text-neutral-400">
          Kurumsal hediye deneyimini farklı kılan özelliklerimiz
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-neutral-200 p-6 transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-lg dark:border-neutral-700 dark:hover:border-red-800"
            >
              <div className="text-3xl">{b.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{b.title}</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gift sets */}
      <div className="container mt-24">
        <h2 className="text-center text-3xl font-bold text-neutral-900 dark:text-white">Hediye Seçenekleri</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-500 dark:text-neutral-400">
          Hazır paketlerimizden seçin veya tamamen size özel bir paket tasarlayalım
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {giftSets.map((set, i) => (
            <div
              key={i}
              className={`relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br p-8 ${set.accent} ${
                set.popular ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {set.popular && (
                <span className="absolute top-4 right-4 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                  EN POPÜLER
                </span>
              )}
              <div className="text-4xl">{set.icon}</div>
              <h3 className="mt-4 text-xl font-bold text-neutral-900 dark:text-white">{set.name}</h3>
              <p className="mt-2 flex-1 text-sm text-neutral-600 dark:text-neutral-400">{set.desc}</p>
              <div className="mt-6 text-2xl font-bold text-neutral-900 dark:text-white">{set.price}</div>
              <ButtonPrimary href="/contact" className="mt-4 w-full text-center" size="smaller">
                Teklif Al
              </ButtonPrimary>
            </div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div className="container mt-24">
        <h2 className="text-center text-3xl font-bold text-neutral-900 dark:text-white">Nasıl Çalışır?</h2>
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: '01', title: 'Teklif Alın', desc: 'Adet, bütçe ve tercihinizi paylaşın' },
            { step: '02', title: 'Tasarım Onayı', desc: 'Kutu ve ambalaj tasarımını birlikte belirleyelim' },
            { step: '03', title: 'Taze Kavurma', desc: 'Hediye tarihinize göre sipariş üzerine kavrulur' },
            { step: '04', title: 'Teslimat', desc: 'Tek veya çoklu adrese güvenle teslim edilir' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-800 dark:bg-red-900/30 dark:text-red-300">
                {s.step}
              </div>
              <h3 className="mt-4 font-semibold text-neutral-900 dark:text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container mt-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-red-800 to-red-900 p-12 text-center text-white lg:p-16">
          <h2 className="text-3xl font-bold">Özel teklifinizi hemen alın</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            20+ adet siparişlerde toplu indirim. Hediye tarihinize göre taze kavurma garantisi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-red-900 shadow-lg transition hover:bg-neutral-100">
              Teklif Alın
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
