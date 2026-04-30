import { Metadata } from 'next'
import { getApiReferences } from '@/lib/api'
import { resolveImageUrl } from '@/lib/adapters'

export const metadata: Metadata = {
  title: 'Referanslar',
  description: 'Pure Olentia müşteri referansları ve başarı hikayeleri.',
}

interface Reference {
  id: string
  companyName: string
  logo?: string
  testimonial?: string
  contactPerson?: string
  sector?: string
}

const FALLBACK_REFERENCES: Reference[] = [
  { id: '1', companyName: 'Hilton İstanbul', sector: 'Otel', testimonial: 'Misafirlerimize sunduğumuz kahve kalitesinde ciddi bir artış yaşadık.', contactPerson: 'Mehmet K., F&B Müdürü' },
  { id: '2', companyName: 'WeWork İstanbul', sector: 'Ofis', testimonial: 'Çalışanlarımız artık dışarıdan kahve almıyor. Pure Olentia kahveleri herkesin favorisi oldu.', contactPerson: 'Ayşe T., Operasyon Müdürü' },
  { id: '3', companyName: 'Petra Roastery', sector: 'Kafe', testimonial: 'Hammadde kalitesi ve tedarik sürekliliği konusunda hiçbir sorun yaşamadık.', contactPerson: 'Can B., Kurucu' },
  { id: '4', companyName: 'Nusret Steakhouse', sector: 'Restoran', testimonial: 'Misafirlerimiz yemek sonrası kahve deneyiminden çok memnun.', contactPerson: 'Deniz A., Genel Müdür' },
]

const stats = [
  { value: '200+', label: 'Kurumsal Müşteri' },
  { value: '50+', label: 'Otel & Restoran' },
  { value: '15+', label: 'Şehir' },
  { value: '%98', label: 'Memnuniyet Oranı' },
]

export default async function ReferencesPage() {
  let references: Reference[] = []
  try {
    const res = (await getApiReferences()) as any
    const list: any[] = res?.data || res || []
    if (Array.isArray(list) && list.length) {
      references = list.map((r: any) => ({
        id: r.id || String(Math.random()),
        companyName: r.companyName || '',
        logo: r.logo || undefined,
        testimonial: r.testimonial || '',
        contactPerson: r.contactPerson || '',
        sector: r.sector || '',
      }))
    }
  } catch {}

  if (!references.length) references = FALLBACK_REFERENCES

  return (
    <div className="container pb-24 lg:pb-32">
      {/* Hero */}
      <div className="mx-auto my-16 max-w-3xl text-center lg:my-24">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Referanslarımız
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Türkiye'nin öncü otel, restoran ve ofislerine premium kahve tedarikçisiyiz.
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
        <h2 className="mb-10 text-center text-2xl font-semibold">Müşterilerimiz Ne Diyor?</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {references.map((ref) => (
            <div key={ref.id} className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                {ref.logo ? (
                  <img
                    src={resolveImageUrl(ref.logo)}
                    alt={ref.companyName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {(ref.companyName || '?')[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{ref.companyName}</h3>
                  {ref.sector && <span className="text-xs text-neutral-500">{ref.sector}</span>}
                </div>
              </div>
              {ref.testimonial && (
                <p className="mt-4 text-sm text-neutral-600 italic dark:text-neutral-400">"{ref.testimonial}"</p>
              )}
              {ref.contactPerson && (
                <p className="mt-3 text-xs font-medium text-neutral-500">{ref.contactPerson}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
