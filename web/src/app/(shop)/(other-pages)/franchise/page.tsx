import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Select } from '@/shared/select'
import { Textarea } from '@/shared/textarea'
import { Metadata } from 'next'
import Form from 'next/form'

export const metadata: Metadata = {
  title: 'Franchise Basvurusu',
  description: 'Pure Olentia franchise basvurusu. Kendi kahve dukkâninizi acin.',
}

const steps = [
  { step: '01', title: 'Basvuru Formu', desc: 'Asagidaki formu doldurun' },
  { step: '02', title: 'Degerlendirme', desc: 'Ekibimiz basvurunuzu inceler' },
  { step: '03', title: 'Gorusme', desc: 'Detaylari konusmak icin bulusuruz' },
  { step: '04', title: 'Acilis', desc: 'Pure Olentia ailesine katilirsiniz' },
]

export default async function FranchisePage() {
  const handleSubmit = async (formData: FormData) => {
    'use server'
    console.log(Object.fromEntries(formData.entries()))
  }

  return (
    <div className="container pb-24 lg:pb-32">
      {/* Hero */}
      <div className="mx-auto my-16 max-w-3xl text-center lg:my-24">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Pure Olentia Franchise
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Specialty kahve tutkusunu kendi isletmenizle paylasın.
          Pure Olentia franchise modeli ile kahve sektorunde yerinizi alin.
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
        <h2 className="text-center text-2xl font-semibold">Basvuru Formu</h2>
        <Form action={handleSubmit} className="mt-10">
          <Fieldset>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Label>Ad Soyad</Label>
                  <Input name="fullName" required />
                </Field>
                <Field>
                  <Label>Telefon</Label>
                  <Input name="phone" required />
                </Field>
              </div>
              <Field>
                <Label>E-posta</Label>
                <Input name="email" type="email" required />
              </Field>
              <Field>
                <Label>Sehir</Label>
                <Input name="city" placeholder="Hangi sehirde acmayi dusunuyorsunuz?" required />
              </Field>
              <Field>
                <Label>Yatirim Butcesi</Label>
                <select name="budget" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800">
                  <option value="">Seciniz</option>
                  <option value="500k-1m">500.000 - 1.000.000 TL</option>
                  <option value="1m-2m">1.000.000 - 2.000.000 TL</option>
                  <option value="2m+">2.000.000 TL ve uzeri</option>
                </select>
              </Field>
              <Field>
                <Label>Is Deneyiminiz</Label>
                <Textarea name="experience" rows={3} placeholder="Daha once isletme tecrübeniz var mi?" />
              </Field>
              <Field>
                <Label>Ek Notlar</Label>
                <Textarea name="notes" rows={3} />
              </Field>
              <ButtonPrimary type="submit" className="w-full">
                Basvurumu Gonder
              </ButtonPrimary>
              <p className="text-center text-xs text-neutral-400">
                Basvurunuz 3 is gunu icinde degerlendirilecektir.
              </p>
            </FieldGroup>
          </Fieldset>
        </Form>
      </div>
    </div>
  )
}
