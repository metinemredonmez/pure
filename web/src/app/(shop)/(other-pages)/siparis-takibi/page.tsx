import CmsPage from '@/components/CmsPage'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sipariş Takibi',
  description: 'Pure Olentia siparişinizi takip edin. Kargo numaranız veya sipariş numaranızla anında bilgi alın.',
}

const steps = [
  {
    no: '01',
    title: 'Sipariş Alındı',
    desc: 'Ödemeniz onaylandı ve siparişiniz sisteme düştü. Size onay e-postası gönderdik.',
  },
  {
    no: '02',
    title: 'Taze Kavrulur',
    desc: 'Siparişiniz sonrası kahveniz özenle, sipariş üzerine kavrulur. Bu aşama genellikle 24 saat içinde tamamlanır.',
  },
  {
    no: '03',
    title: 'Paketleme',
    desc: 'Kavrulduktan sonra valf kontrollü özel paketlerde hava sızdırmaz şekilde paketlenir. Kavurma tarihi ambalaja yazılır.',
  },
  {
    no: '04',
    title: 'Kargoya Teslim',
    desc: 'Anlaşmalı kargo firmamıza teslim edilir. Takip numaranız e-posta ile size iletilir.',
  },
  {
    no: '05',
    title: 'Kapınızda',
    desc: 'Ortalama 1-3 iş günü içinde kapınızda. İstanbul içi bazı bölgelerde aynı gün teslimat mümkün.',
  },
]

function StaticSiparisTakibiFallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl text-center lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">Sipariş Takibi</span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Siparişiniz Nerede?
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Sipariş numaranızı ve e-posta adresinizi girerek siparişinizin güncel durumunu öğrenin.
        </p>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-xl rounded-3xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <form>
          <Fieldset>
            <FieldGroup>
              <Field>
                <Label>Sipariş Numarası</Label>
                <Input name="orderNumber" placeholder="OL-2026-0000" />
              </Field>
              <Field>
                <Label>E-posta Adresi</Label>
                <Input name="email" type="email" placeholder="ornek@email.com" />
              </Field>
              <div className="pt-2">
                <ButtonPrimary type="submit" className="w-full">
                  Sipariş Durumunu Sorgula
                </ButtonPrimary>
              </div>
            </FieldGroup>
          </Fieldset>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Sipariş numaranızı bulamıyor musunuz?{' '}
          <a href="/contact" className="font-medium text-primary-700 hover:underline">
            Bizimle iletişime geçin
          </a>
        </p>
      </div>

      {/* Steps */}
      <div className="mx-auto mt-20 max-w-5xl">
        <h2 className="mb-12 text-center text-2xl font-semibold text-neutral-900 dark:text-white">
          Siparişinizin Yolculuğu
        </h2>
        <div className="space-y-6">
          {steps.map((s) => (
            <div
              key={s.no}
              className="flex gap-6 rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-50 text-lg font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                {s.no}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SiparisTakibiPage() {
  return (
    <CmsPage slug="siparis-takibi" kicker="Sipariş Takibi" fallback={<StaticSiparisTakibiFallback />} />
  )
}

