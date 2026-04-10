import { Divider } from '@/components/Divider'
import SectionPromo1 from '@/components/SectionPromo1'
import SocialsList from '@/shared/SocialsList/SocialsList'
import { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'Pure Olentia ile iletişime geçin. Sorularınız, önerileriniz ve toplu sipariş talepleriniz için.',
}

const info = [
  {
    title: 'ADRES',
    desc: 'Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul',
  },
  {
    title: 'E-POSTA',
    desc: 'info@pureolentia.com',
  },
  {
    title: 'TELEFON',
    desc: '0552 462 29 54',
  },
]

const PageContact = async () => {
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
            src="https://maps.google.com/maps?q=Abdurrahmangazi%2C%20Nane%20Sk.%20No%3A8%2C%2034887%20Sancaktepe%2F%C4%B0stanbul&output=embed"
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
