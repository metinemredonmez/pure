import { Metadata } from 'next'
import Image from 'next/image'
import FranchiseForm from './FranchiseForm'

export const metadata: Metadata = {
  title: 'Franchise Başvurusu',
  description: 'Pure Olentia franchise başvurusu. Kendi kahve dükkânınızı açın.',
}

// 3 banner images — admin can later manage these via /website/banners or a dedicated franchise gallery
const FRANCHISE_BANNERS = [
  { src: '/hero/turk-kahvesi-100gr.jpg', alt: 'Pure Olentia Franchise — Türk Kahvesi' },
  { src: '/hero/brazil-santos.jpg', alt: 'Pure Olentia Franchise — Filtre Kahve' },
  { src: '/hero/hediye-paketi.jpg', alt: 'Pure Olentia Franchise — Hediye Paketi' },
]

export default function FranchisePage() {
  return (
    <div className="container pb-24 lg:pb-32">
      {/* Hero */}
      <div className="mx-auto my-16 max-w-3xl text-center lg:my-24">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Pure Olentia Franchise
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Specialty kahve tutkusunu kendi işletmenizle paylaşın. Pure Olentia franchise modeli ile kahve
          sektöründe yerinizi alın.
        </p>
      </div>

      {/* 3-Banner Area (images will be replaced by admin later) */}
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-4 sm:grid-cols-3">
          {FRANCHISE_BANNERS.map((banner, i) => (
            <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-neutral-400">
          Görseller daha sonra tarafımızdan eklenecektir.
        </p>
      </div>

      {/* Form */}
      <div className="mx-auto mt-20 max-w-xl">
        <h2 className="text-center text-2xl font-semibold">Başvuru Formu</h2>
        <FranchiseForm />
      </div>
    </div>
  )
}
