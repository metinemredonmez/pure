import BgGlassmorphism from '@/components/BgGlassmorphism/BgGlassmorphism'
import { Divider } from '@/components/Divider'
import SectionClientSay from '@/components/SectionClientSay'
import SectionPromo1 from '@/components/SectionPromo1'
import { getSiteSettings } from '@/lib/site-settings'
import { Metadata } from 'next'
import SectionHero from './SectionHero'
import SectionStatistic from './SectionStatistic'

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'Pure Olentia — Tarladan fincana izlenebilir specialty kahve deneyimi.',
}

const PageAbout = async () => {
  const settings = await getSiteSettings()
  const mapSrc =
    settings.mapLat && settings.mapLng
      ? `https://maps.google.com/maps?q=${settings.mapLat},${settings.mapLng}&z=15&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`

  return (
    <div>
      <BgGlassmorphism />
      <div className="container flex flex-col gap-y-16 py-16 lg:gap-y-28 lg:py-28 lg:pt-20">
        <SectionHero
          rightImg="/hero/brazil-santos.jpg"
          heading="Pure Olentia"
          subHeading="Tarladan fincana, her çekirdeğin hikayesini takip edebileceğiniz izlenebilir kahve deneyimi. Sürdürülebilir kaynaklardan temin edilen, özenle kavrulmuş specialty kahveler ile kahve kültürünü yeniden tanımlıyoruz."
        />

        <Divider />
        <SectionStatistic />

        <Divider />
        <SectionClientSay />

        {/* Harita */}
        <Divider />
        <div>
          <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-white">Bizi Ziyaret Edin</h2>
          <div className="overflow-hidden rounded-2xl">
            <iframe
              src={mapSrc}
              width="100%"
              height="450"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-2xl"
              style={{ border: 0, filter: 'saturate(0.3) contrast(1.2) brightness(0.75)' }}
            />
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {settings.address && (
              <div className="rounded-xl bg-neutral-50 p-5 dark:bg-neutral-800">
                <h3 className="font-semibold">Adres</h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{settings.address}</p>
              </div>
            )}
            {settings.phone && (
              <div className="rounded-xl bg-neutral-50 p-5 dark:bg-neutral-800">
                <h3 className="font-semibold">Telefon</h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-primary-600">
                    {settings.phone}
                  </a>
                </p>
                {settings.workingHours && (
                  <p className="mt-1 text-xs text-neutral-400">{settings.workingHours}</p>
                )}
              </div>
            )}
            {settings.email && (
              <div className="rounded-xl bg-neutral-50 p-5 dark:bg-neutral-800">
                <h3 className="font-semibold">E-posta</h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <a href={`mailto:${settings.email}`} className="hover:text-primary-600">
                    {settings.email}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  )
}

export default PageAbout
