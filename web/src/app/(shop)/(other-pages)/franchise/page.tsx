import { KeyIcon, Award01Icon, CoffeeIcon, Megaphone01Icon, AnalyticsUpIcon, CallIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { Metadata } from 'next'
import FranchiseForm from './FranchiseForm'

export const metadata: Metadata = {
  title: 'Franchise Başvurusu',
  description: 'Pure Olentia franchise başvurusu. Kendi kahve dükkânınızı açın.',
}

const stats = [
  { value: '₺500K+', label: 'Yatırım Aralığı' },
  { value: '3-6 Ay', label: 'Açılış Süreci' },
  { value: '%100', label: 'Barista Eğitimi' },
  { value: '7/24', label: 'Destek' },
]

const benefits = [
  { title: 'Anahtar Teslim Konsept', desc: 'Mekan tasarımından ekipman seçimine kadar komple çözüm.', icon: <HugeiconsIcon icon={KeyIcon} size={24} color="currentColor" strokeWidth={1.5} /> },
  { title: 'Barista Eğitimi', desc: 'SCA standartlarında profesyonel barista eğitimi ve sertifika.', icon: <HugeiconsIcon icon={Award01Icon} size={24} color="currentColor" strokeWidth={1.5} /> },
  { title: 'Taze Kavurma Tedarik', desc: 'Merkezi kavurma tesisimizden düzenli taze kahve tedariki.', icon: <HugeiconsIcon icon={CoffeeIcon} size={24} color="currentColor" strokeWidth={1.5} /> },
  { title: 'Pazarlama Desteği', desc: 'Dijital pazarlama, sosyal medya ve yerel kampanya desteği.', icon: <HugeiconsIcon icon={Megaphone01Icon} size={24} color="currentColor" strokeWidth={1.5} /> },
  { title: 'Operasyon Danışmanlığı', desc: 'Menü mühendisliği, maliyet kontrolü ve iş süreçleri danışmanlığı.', icon: <HugeiconsIcon icon={AnalyticsUpIcon} size={24} color="currentColor" strokeWidth={1.5} /> },
  { title: 'Marka Gücü', desc: 'Pure Olentia marka bilinirliği ve sadık müşteri tabanı.', icon: <HugeiconsIcon icon={Award01Icon} size={24} color="currentColor" strokeWidth={1.5} /> },
]

export default function FranchisePage() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero — full width gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-900 to-neutral-900">
        <div className="container py-20 text-center text-white lg:py-28">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
            Franchise Fırsatı
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Pure Olentia ile <br /> Kendi Kahve Dükkânınızı Açın
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Specialty kahve tutkusunu kendi işletmenizle paylaşın. Anahtar teslim konsept, barista eğitimi
            ve sürekli destek ile kahve sektöründe yerinizi alın.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#form" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary-800 shadow-lg transition hover:bg-neutral-100">
              Başvuru Yap
            </a>
            <a href="tel:+905524622954" className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              <HugeiconsIcon icon={CallIcon} size={16} color="currentColor" strokeWidth={1.5} /> 0552 462 29 54
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-5 select-none"><HugeiconsIcon icon={CoffeeIcon} size={160} color="currentColor" strokeWidth={1} /></div>
      </div>

      {/* Stats */}
      <div className="container -mt-8">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 text-center shadow-lg dark:bg-neutral-800">
              <div className="text-2xl font-bold text-primary-700">{s.value}</div>
              <div className="mt-1 text-xs text-neutral-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Banner Gallery */}
      <div className="container mt-20">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Pure Olentia Mağaza Konsepti</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-500 dark:text-neutral-400">
          Modern ve sıcak atmosferde specialty kahve deneyimi
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { src: '/hero/turk-kahvesi-100gr.jpg', alt: 'Pure Olentia Mağaza — İç Mekan' },
            { src: '/hero/brazil-santos.jpg', alt: 'Pure Olentia Mağaza — Ürünler' },
            { src: '/hero/hediye-paketi.jpg', alt: 'Pure Olentia Mağaza — Hediye Paketleri' },
          ].map((img, i) => (
            <div key={i} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="container mt-24">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Franchise Avantajları</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-500 dark:text-neutral-400">
          Pure Olentia franchise modeli ile aldığınız destekler
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <div key={i} className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl transition-transform group-hover:scale-110 dark:bg-primary-900/30">
                {b.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{b.title}</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div className="container mt-24">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Süreç Nasıl İşler?</h2>
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: '01', title: 'Başvuru', desc: 'Formu doldurun, ekibimiz sizi tanısın', color: 'bg-primary-50 text-primary-700' },
            { step: '02', title: 'Görüşme', desc: 'Yüz yüze veya online detaylı görüşme', color: 'bg-amber-50 text-amber-700' },
            { step: '03', title: 'Planlama', desc: 'Lokasyon, tasarım ve yatırım planı', color: 'bg-emerald-50 text-emerald-700' },
            { step: '04', title: 'Açılış', desc: 'Eğitim + açılış kampanyası ile start', color: 'bg-sky-50 text-sky-700' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold ${s.color}`}>
                {s.step}
              </div>
              <h3 className="mt-4 font-semibold text-neutral-900 dark:text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div id="form" className="container mt-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 lg:p-10">
            <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Franchise Başvurusu</h2>
            <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Formu doldurun, ekibimiz 3 iş günü içinde size dönüş yapsın.
            </p>
            <div className="mt-8">
              <FranchiseForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
