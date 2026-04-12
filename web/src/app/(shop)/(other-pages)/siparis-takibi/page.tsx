import { CheckmarkCircleIcon, Coffee01Icon, PackageIcon, DeliveryTruck01Icon, Location01Icon, Invoice01Icon, MailOpen01Icon, SmartPhone01Icon, Globe02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sipariş Takibi',
  description: 'Pure Olentia siparişinizi takip edin. Kargo numaranız veya sipariş numaranızla anında bilgi alın.',
}

const journey = [
  { step: '01', title: 'Sipariş Alındı', desc: 'Ödemeniz onaylandı, onay e-postası gönderildi.', icon: <HugeiconsIcon icon={CheckmarkCircleIcon} size={28} color="currentColor" strokeWidth={1.5} />, color: 'emerald' },
  { step: '02', title: 'Taze Kavrulur', desc: '24 saat içinde siparişinize özel kavrulur.', icon: <HugeiconsIcon icon={Coffee01Icon} size={28} color="currentColor" strokeWidth={1.5} />, color: 'orange' },
  { step: '03', title: 'Paketleme', desc: 'Valf kontrollü özel pakette, kavurma tarihi yazılarak paketlenir.', icon: <HugeiconsIcon icon={PackageIcon} size={28} color="currentColor" strokeWidth={1.5} />, color: 'sky' },
  { step: '04', title: 'Kargoya Teslim', desc: 'Anlaşmalı kargo firmamıza teslim edilir. Takip numarası e-posta ile iletilir.', icon: <HugeiconsIcon icon={DeliveryTruck01Icon} size={28} color="currentColor" strokeWidth={1.5} />, color: 'violet' },
  { step: '05', title: 'Kapınızda', desc: 'İstanbul içi 1 iş günü, Türkiye geneli 1-3 iş günü.', icon: <HugeiconsIcon icon={Location01Icon} size={28} color="currentColor" strokeWidth={1.5} />, color: 'primary' },
]

const accentBg: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
}

export default function SiparisTakibiPage() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-50 to-violet-50 dark:from-sky-900/20 dark:via-indigo-900/10 dark:to-violet-900/10">
        <div className="container py-20 text-center lg:py-24">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wider text-sky-800 uppercase backdrop-blur-sm dark:bg-neutral-900/60 dark:text-sky-300">
            Sipariş Takibi
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold text-neutral-900 sm:text-5xl dark:text-white">
            Siparişiniz Nerede?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">
            Sipariş numaranızı ve e-posta adresinizi girerek siparişinizin güncel durumunu öğrenin.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mt-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mb-6 text-center">
            <span className="text-4xl"><HugeiconsIcon icon={Invoice01Icon} size={36} color="currentColor" strokeWidth={1.5} /></span>
            <h2 className="mt-3 text-xl font-semibold text-neutral-900 dark:text-white">Sipariş Sorgula</h2>
          </div>
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
                <ButtonPrimary type="submit" className="w-full">
                  Sipariş Durumunu Sorgula
                </ButtonPrimary>
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
      </div>

      {/* Journey */}
      <div className="container mt-24">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Siparişinizin Yolculuğu</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-500 dark:text-neutral-400">
          Siparişiniz bu 5 adımdan geçerek kapınıza ulaşır
        </p>
        <div className="mx-auto mt-12 max-w-4xl space-y-6">
          {journey.map((s, i) => (
            <div
              key={i}
              className="group flex gap-6 rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110 ${accentBg[s.color]}`}>
                {s.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    Adım {s.step}
                  </span>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info cards */}
      <div className="container mt-20">
        <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-sky-50 p-6 text-center dark:bg-sky-900/20">
            <span className="text-3xl"><HugeiconsIcon icon={MailOpen01Icon} size={28} color="currentColor" strokeWidth={1.5} /></span>
            <h3 className="mt-3 font-semibold text-neutral-900 dark:text-white">E-posta Bildirimi</h3>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Her adımda e-posta ile bilgilendirilirsiniz.</p>
          </div>
          <div className="rounded-2xl bg-violet-50 p-6 text-center dark:bg-violet-900/20">
            <span className="text-3xl"><HugeiconsIcon icon={SmartPhone01Icon} size={28} color="currentColor" strokeWidth={1.5} /></span>
            <h3 className="mt-3 font-semibold text-neutral-900 dark:text-white">SMS Takip</h3>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Kargo firmasından SMS ile takip numarası gelir.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
