import { Divider } from '@/components/Divider'
import SectionPromo1 from '@/components/SectionPromo1'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import SocialsList from '@/shared/SocialsList/SocialsList'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Textarea } from '@/shared/textarea'
import { Metadata } from 'next'
import Form from 'next/form'

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'Pure Olentia ile iletişime geçin. Sorularınız, önerileriniz ve toplu sipariş talepleriniz için.',
}

const info = [
  {
    title: 'ADRES',
    desc: 'Pure Olentia Kahve, İstanbul, Türkiye',
  },
  {
    title: 'E-POSTA',
    desc: 'hello@olentia.com',
  },
  {
    title: 'TELEFON',
    desc: '+90 (212) 000 00 00',
  },
]

const PageContact = async () => {
  const handleSubmit = async (formData: FormData) => {
    'use server'
    const formObject = Object.fromEntries(formData.entries())
    console.log(formObject)
  }

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
            <Form action={handleSubmit}>
              <Fieldset>
                <FieldGroup>
                  <Field>
                    <Label>Ad Soyad</Label>
                    <Input name="name" placeholder="Adınız Soyadınız" type="text" />
                  </Field>
                  <Field>
                    <Label>E-posta</Label>
                    <Input name="email" type="email" placeholder="ornek@email.com" />
                  </Field>
                  <Field>
                    <Label>Mesajınız</Label>
                    <Textarea name="message" rows={6} />
                  </Field>
                  <ButtonPrimary type="submit">Mesaj Gönder</ButtonPrimary>
                </FieldGroup>
              </Fieldset>
            </Form>
          </div>
        </div>

        <Divider />

        {/* Harita */}
        <div className="overflow-hidden rounded-2xl">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.6504900564!2d29.0193!3d40.9907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU5JzI2LjUiTiAyOcKwMDEnMDkuNSJF!5e0!3m2!1str!2str!4v1"
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
