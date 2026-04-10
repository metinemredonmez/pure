import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referanslar',
  description: 'Pure Olentia musteri referanslari ve basari hikayeleri.',
}

const references = [
  {
    company: 'Hilton Istanbul',
    sector: 'Otel',
    quote: 'Misafirlerimize sundugumuz kahve kalitesinde ciddi bir artis yasadik.',
    person: 'Mehmet K., F&B Muduru',
  },
  {
    company: 'WeWork Istanbul',
    sector: 'Ofis',
    quote: 'Calisanlarimiz artik disaridan kahve almıyor. Pure Olentia kahveleri herkesin favorisi oldu.',
    person: 'Ayse T., Operasyon Muduru',
  },
  {
    company: 'Petra Roastery',
    sector: 'Kafe',
    quote: 'Hammadde kalitesi ve tedarik surekliligi konusunda hicbir sorun yasamadik.',
    person: 'Can B., Kurucu',
  },
  {
    company: 'Nusret Steakhouse',
    sector: 'Restoran',
    quote: 'Misafirlerimiz yemek sonrasi kahve deneyiminden cok memnun.',
    person: 'Deniz A., Genel Mudur',
  },
]

const stats = [
  { value: '200+', label: 'Kurumsal Musteri' },
  { value: '50+', label: 'Otel & Restoran' },
  { value: '15+', label: 'Sehir' },
  { value: '%98', label: 'Memnuniyet Orani' },
]

export default function ReferencesPage() {
  return (
    <div className="container pb-24 lg:pb-32">
      {/* Hero */}
      <div className="mx-auto my-16 max-w-3xl text-center lg:my-24">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Referanslarimiz
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Turkiye'nin oncu otel, restoran ve ofislerine premium kahve tedarikcisiyiz.
        </p>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl bg-primary-50 p-6 text-center dark:bg-neutral-800">
              <div className="text-3xl font-bold text-primary-700 dark:text-primary-400">{s.value}</div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="mx-auto mt-20 max-w-4xl">
        <h2 className="mb-10 text-center text-2xl font-semibold">Musterilerimiz Ne Diyor?</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {references.map((ref, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                  {ref.company[0]}
                </div>
                <div>
                  <h3 className="font-semibold">{ref.company}</h3>
                  <span className="text-xs text-neutral-500">{ref.sector}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-neutral-600 italic dark:text-neutral-400">"{ref.quote}"</p>
              <p className="mt-3 text-xs font-medium text-neutral-500">{ref.person}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
