import BgGlassmorphism from '@/components/BgGlassmorphism/BgGlassmorphism'
import { Divider } from '@/components/Divider'
import SectionClientSay from '@/components/SectionClientSay'
import SectionPromo1 from '@/components/SectionPromo1'
import rightImg from '@/images/hero-right1.png'
import { Metadata } from 'next'
import SectionHero from './SectionHero'
import SectionStatistic from './SectionStatistic'

export const metadata: Metadata = {
  title: 'Hakkimizda',
  description:
    'Pure Olentia - Tarladan fincana izlenebilir kahve deneyimi.',
}

const PageAbout = () => {
  return (
    <div>
      <BgGlassmorphism />
      <div className="container flex flex-col gap-y-16 py-16 lg:gap-y-28 lg:py-28 lg:pt-20">
        <SectionHero
          rightImg={rightImg}
          heading="Pure Olentia"
          subHeading="Tarladan fincana, her cekirdegin hikayesini takip edebileceginiz izlenebilir kahve deneyimi. Surdurulebilir kaynaklardan temin edilen, ozenle kavrulmus specialty kahveler ile kahve kulturunu yeniden tanimliyoruz."
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
              src="https://maps.google.com/maps?q=Abdurrahmangazi%2C%20Nane%20Sk.%20No%3A8%2C%2034887%20Sancaktepe%2F%C4%B0stanbul&output=embed"
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
            <div className="rounded-xl bg-neutral-50 p-5 dark:bg-neutral-800">
              <h3 className="font-semibold">Adres</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-5 dark:bg-neutral-800">
              <h3 className="font-semibold">Telefon</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                <a href="tel:+905524622954" className="hover:text-primary-600">0552 462 29 54</a>
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-5 dark:bg-neutral-800">
              <h3 className="font-semibold">E-posta</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                <a href="mailto:info@pureolentia.com" className="hover:text-primary-600">info@pureolentia.com</a>
              </p>
            </div>
          </div>
        </div>

        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  )
}

export default PageAbout
