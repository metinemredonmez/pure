import { Metadata } from 'next'
import FranchiseForm from './FranchiseForm'

export const metadata: Metadata = {
  title: 'Franchise Başvurusu',
  description: 'Pure Olentia franchise başvurusu. Kendi kahve dükkânınızı açın.',
}

const steps = [
  { step: '01', title: 'Başvuru Formu', desc: 'Aşağıdaki formu doldurun' },
  { step: '02', title: 'Değerlendirme', desc: 'Ekibimiz başvurunuzu inceler' },
  { step: '03', title: 'Görüşme', desc: 'Detayları konuşmak için buluşuruz' },
  { step: '04', title: 'Açılış', desc: 'Pure Olentia ailesine katılırsınız' },
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

      {/* Steps */}
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                {s.step}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto mt-20 max-w-xl">
        <h2 className="text-center text-2xl font-semibold">Başvuru Formu</h2>
        <FranchiseForm />
      </div>
    </div>
  )
}
