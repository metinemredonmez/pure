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
    <div className="pb-24 lg:pb-32">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-primary-900 to-neutral-900">
        <div className="container grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="text-white">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
              B2B Toptan
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Toptan Kahve <br /> Tedariği
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/70">
              Kafe, restoran, otel ve ofisler için özel fiyatlarla taze kavrulmuş specialty kahve.
              Düzenli teslimat, barista desteği ve özel blend geliştirme.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 shadow-lg transition hover:bg-neutral-100">
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

          <div className="relative mx-auto w-full max-w-lg">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src="/hero/brazil-santos.jpg"
                alt="Pure Olentia Toptan Kahve"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-20 -left-20 opacity-5 select-none"><HugeiconsIcon icon={CoffeeIcon} size={180} color="currentColor" strokeWidth={1} /></div>
      </div>

      {/* Advantage stats */}
      <div className="container mt-12 lg:-mt-10">
        <div className="relative z-10 mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {advantages.map((a, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 text-center shadow-lg dark:bg-neutral-800">
              <div className="text-2xl font-bold text-primary-700">{a.value}</div>
              <div className="mt-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200">{a.label}</div>
              <div className="mt-1 text-xs text-neutral-500">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Segments */}
      <div className="container mt-24">
        <h2 className="text-center text-3xl font-bold text-neutral-900 dark:text-white">Hangi Sektördesiniz?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-500 dark:text-neutral-400">
          Her sektöre özel çözümler sunuyoruz
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {segments.map((s, i) => (
            <div
              key={i}
              className="group flex gap-6 rounded-3xl border border-neutral-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-3xl transition-transform group-hover:scale-110 dark:bg-primary-900/30">
                {s.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{s.desc}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  Min. sipariş: {s.minOrder}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What we offer */}
      <div className="container mt-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-neutral-50 p-10 dark:bg-neutral-800 lg:p-14">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Toptan Müşterilerimize Sunduklarımız</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              'Hacme göre kademeli toptan fiyatlar',
              'Düzenli otomatik teslimat programı',
              'İşletmenize özel blend geliştirme',
              'Yerinde barista eğitimi desteği',
              'Espresso makinesi ve öğütücü danışmanlığı',
              'Özel ambalaj ve markalama (white label)',
              'Fatura ve kurumsal ödeme kolaylığı',
              'Dedike müşteri temsilcisi',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  ✓
                </span>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mt-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 p-12 text-center text-white lg:p-16">
          <h2 className="text-3xl font-bold">İşletmeniz için özel teklif alın</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Hacminize, sektörünüze ve ihtiyaçlarınıza göre özelleştirilmiş fiyat teklifi 24 saat içinde e-posta adresinize gönderilir.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary-800 shadow-lg transition hover:bg-neutral-100">
              Teklif Alın
            </a>
            <a href="/b2b" className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-white/10">
              Kurumsal Çözümler
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="toptan-satis" kicker="Kurumsal" fallback={<Fallback />} />
}
