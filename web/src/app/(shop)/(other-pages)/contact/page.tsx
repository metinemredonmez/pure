import { Divider } from '@/components/Divider'
import SectionPromo1 from '@/components/SectionPromo1'
import { getSiteSettings } from '@/lib/site-settings'
import SocialsList from '@/shared/SocialsList/SocialsList'
import { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'Pure Olentia ile iletişime geçin. Sorularınız, önerileriniz ve toplu sipariş talepleriniz için.',
}

const PageContact = async () => {
  const settings = await getSiteSettings()
  const info = [
    { title: 'ADRES', desc: settings.address },
    { title: 'E-POSTA', desc: settings.email },
    { title: 'TELEFON', desc: settings.phone },
    settings.workingHours && { title: 'ÇALIŞMA SAATLERİ', desc: settings.workingHours },
  ].filter((x): x is { title: string; desc: string } => Boolean(x && (x as any).desc))

  // Build Google Maps embed URL from lat/lng if available, else query by address
  const mapSrc =
    settings.mapLat && settings.mapLng
      ? `https://maps.google.com/maps?q=${settings.mapLat},${settings.mapLng}&z=15&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`

  return (
    <div className="pt-12 pb-16 sm:py-16 lg:py-24">
      <div className="container mx-auto flex max-w-6xl flex-col gap-y-16 lg:gap-y-28">
        <div className="grid shrink-0 grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl leading-[1.15] font-semibold tracking-tight text-neutral-900 md:text-5xl dark:text-neutral-100">
              İletişim
            </h1>
            <div className="mt-10 flex max-w-sm flex-col gap-y-8 sm:mt-14">
              {info.map((item, index) => (
                <div key={index}>
                  <p className="text-sm font-semibold tracking-wider uppercase dark:text-neutral-200">{item.title}</p>
                  <span className="mt-4 block text-neutral-500 dark:text-neutral-400">{item.desc}</span>
                </div>
              ))}
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase dark:text-neutral-200">SOSYAL MEDYA</p>
                <SocialsList className="mt-4" />
              </div>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>

        <Divider />

        {/* Harita */}
        <div className="overflow-hidden rounded-2xl">
          <iframe
            src={mapSrc}
            width="100%"
            height="400"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-2xl"
            style={{ border: 0, filter: 'saturate(0.3) contrast(1.2) brightness(0.75)' }}
          />
        </div>
      </div>

      <div className="container pt-16 lg:pt-28">
        <SectionPromo1 />
      </div>
    </div>
  )
}

export default PageContact
