import { Calendar01Icon, CoffeeIcon, Settings01Icon, ReturnRequestIcon, DeliveryTruck01Icon, CreditCardIcon, MailOpen01Icon, CheckmarkCircleIcon, PackageIcon, CreditCardPosIcon, AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'İade & Değişim',
  description: 'Pure Olentia iade ve değişim koşulları. Tüketici haklarınız kapsamında 14 gün içinde iade hakkı.',
}

const conditions = [
  { icon: <HugeiconsIcon icon={Calendar01Icon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'İade Süresi', desc: 'Ürünü teslim aldıktan sonra 14 gün içinde iade hakkınız vardır. Mesafeli Satış Sözleşmeleri Yönetmeliği ile güvence altındadır.', color: 'amber' },
  { icon: <HugeiconsIcon icon={CoffeeIcon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Kahve Ürünleri', desc: 'Ambalajı açılmamış, mühürü bozulmamış kavrulmuş kahve ürünleri iade edilebilir. Açılan paketler hijyen nedeniyle iade edilemez.', color: 'primary' },
  { icon: <HugeiconsIcon icon={Settings01Icon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Ekipmanlar', desc: 'Orijinal ambalajında, kullanılmamış, tüm aksesuarları tam olan ekipmanlar 14 gün içinde iade edilebilir.', color: 'sky' },
  { icon: <HugeiconsIcon icon={ReturnRequestIcon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Abonelikler', desc: 'Abonelik planlarınızı istediğiniz zaman hesap panelinizden iptal edebilirsiniz. İptal sonrası gönderilen sipariş iade edilebilir.', color: 'emerald' },
  { icon: <HugeiconsIcon icon={DeliveryTruck01Icon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Kargo Ücreti', desc: 'Hatalı gönderim veya üründe kusur varsa kargo Pure Olentia tarafından karşılanır. Cayma hakkında iade kargo müşteriye aittir.', color: 'rose' },
  { icon: <HugeiconsIcon icon={CreditCardIcon} size={24} color="currentColor" strokeWidth={1.5} />, title: 'Ücret İadesi', desc: 'Ürün tarafımıza ulaştıktan sonra 7 iş günü içinde ödeme yönteminize uygun şekilde ücret iadesi yapılır.', color: 'violet' },
]

const steps = [
  { no: '1', title: 'Bize Ulaşın', desc: 'İade talebinizi info@pureolentia.com adresine sipariş numaranızla iletin.', icon: <HugeiconsIcon icon={MailOpen01Icon} size={28} color="currentColor" strokeWidth={1.5} /> },
  { no: '2', title: 'Onay Alın', desc: 'Ekibimiz 24 saat içinde size dönüş yaparak iade kodunuzu paylaşır.', icon: <HugeiconsIcon icon={CheckmarkCircleIcon} size={28} color="currentColor" strokeWidth={1.5} /> },
  { no: '3', title: 'Kargoya Verin', desc: 'Ürünü orijinal ambalajında, iade kodu ile birlikte bize gönderin.', icon: <HugeiconsIcon icon={PackageIcon} size={28} color="currentColor" strokeWidth={1.5} /> },
  { no: '4', title: 'İade Tamamlandı', desc: 'Ürün ulaştıktan sonra 7 iş günü içinde ücretiniz iade edilir.', icon: <HugeiconsIcon icon={CreditCardPosIcon} size={28} color="currentColor" strokeWidth={1.5} /> },
]

const accentBg: Record<string, string> = {
  amber: 'bg-amber-50 dark:bg-amber-900/20',
  primary: 'bg-primary-50 dark:bg-primary-900/20',
  sky: 'bg-sky-50 dark:bg-sky-900/20',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
  rose: 'bg-rose-50 dark:bg-rose-900/20',
  violet: 'bg-violet-50 dark:bg-violet-900/20',
}

function Fallback() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-rose-900/20 dark:via-pink-900/10 dark:to-orange-900/10">
        <div className="container py-20 text-center lg:py-24">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wider text-rose-800 uppercase backdrop-blur-sm dark:bg-neutral-900/60 dark:text-rose-300">
            Müşteri Hakları
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold text-neutral-900 sm:text-5xl dark:text-white">
            İade & Değişim
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">
            Memnuniyetiniz önceliğimizdir. 14 gün içinde koşulsuz iade hakkınız vardır.
          </p>
        </div>
      </div>

      <div className="container mt-16">
        <div className="mx-auto max-w-5xl space-y-20">
          {/* Conditions */}
          <section>
            <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">İade Koşulları</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {conditions.map((c, i) => (
                <div key={i} className={`rounded-2xl p-6 ${accentBg[c.color] || accentBg.amber}`}>
                  <span className="text-3xl">{c.icon}</span>
                  <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-white">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section>
            <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">İade Adımları</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <div key={i} className="relative text-center">
                  {i < steps.length - 1 && (
                    <div className="pointer-events-none absolute top-10 right-0 hidden h-0.5 w-[calc(100%-3rem)] translate-x-1/2 border-t-2 border-dashed border-neutral-200 lg:block dark:border-neutral-700" />
                  )}
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 text-3xl dark:from-rose-900/30 dark:to-pink-900/30">
                    {s.icon}
                  </div>
                  <div className="mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
                    {s.no}
                  </div>
                  <h3 className="mt-3 font-semibold text-neutral-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Important note */}
          <section>
            <div className="rounded-2xl border-l-4 border-rose-500 bg-rose-50 p-8 dark:border-rose-600 dark:bg-rose-900/20">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white"><HugeiconsIcon icon={AlertCircleIcon} size={20} color="currentColor" strokeWidth={1.5} /> Önemli Hatırlatma</h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex gap-2"><span className="shrink-0">•</span>Ambalajı açılmış kahve ürünleri hijyen nedeniyle iade edilemez.</li>
                <li className="flex gap-2"><span className="shrink-0">•</span>İade edilecek ürünlerin orijinal ambalajında ve kullanılmamış olması gerekir.</li>
                <li className="flex gap-2"><span className="shrink-0">•</span>Kusurlu ürün teslimatında fotoğraf çekilmesi ve 24 saat içinde bildirilmesi gerekmektedir.</li>
                <li className="flex gap-2"><span className="shrink-0">•</span>Hediye paketlerinde iade talebi alıcı tarafından da yapılabilir.</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">İade veya değişim talebi için:</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <ButtonPrimary href="/contact">Bize Ulaşın</ButtonPrimary>
              <a href="mailto:info@pureolentia.com" className="flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300">
                <HugeiconsIcon icon={MailOpen01Icon} size={16} color="currentColor" strokeWidth={1.5} /> info@pureolentia.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="iade-degisim" kicker="Müşteri Hizmetleri" fallback={<Fallback />} />
}
