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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.6504900564!2d29.0193!3d40.9907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU5JzI2LjUiTiAyOcKwMDEnMDkuNSJF!5e0!3m2!1str!2str!4v1"
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
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Istanbul, Turkiye</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-5 dark:bg-neutral-800">
              <h3 className="font-semibold">Telefon</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">+90 (212) 000 00 00</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-5 dark:bg-neutral-800">
              <h3 className="font-semibold">E-posta</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">hello@pureolentia.com</p>
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
