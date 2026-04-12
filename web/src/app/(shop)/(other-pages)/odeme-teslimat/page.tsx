import { CreditCardIcon, Invoice01Icon, SmartPhone01Icon, Shield01Icon, Building01Icon, Globe02Icon, Location01Icon, ShoppingCart01Icon, Coffee01Icon, PackageIcon, DeliveryTruck01Icon, BulbIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ödeme & Teslimat',
  description: 'Pure Olentia ödeme yöntemleri ve kargo/teslimat bilgileri.',
}

const paymentMethods = [
  { icon: <HugeiconsIcon icon={CreditCardIcon} size={28} color="currentColor" strokeWidth={1.5} />, name: 'Kredi / Banka Kartı', desc: 'Visa, Mastercard, Troy ile güvenli ödeme. Taksit seçenekleri mevcut.' },
  { icon: <HugeiconsIcon icon={Invoice01Icon} size={28} color="currentColor" strokeWidth={1.5} />, name: 'Havale / EFT', desc: 'Sipariş onayından sonra 24 saat içinde ödemenizi yapın.' },
  { icon: <HugeiconsIcon icon={SmartPhone01Icon} size={28} color="currentColor" strokeWidth={1.5} />, name: 'Mobil Ödeme', desc: 'Apple Pay ve Google Pay ile hızlı ödeme.' },
]

const shippingZones = [
  { zone: 'İstanbul İçi', time: '1 iş günü', icon: <HugeiconsIcon icon={Building01Icon} size={28} color="currentColor" strokeWidth={1.5} /> },
  { zone: 'Büyükşehirler', time: '1-2 iş günü', icon: <HugeiconsIcon icon={Globe02Icon} size={28} color="currentColor" strokeWidth={1.5} /> },
  { zone: 'Diğer İller', time: '2-3 iş günü', icon: <HugeiconsIcon icon={Location01Icon} size={28} color="currentColor" strokeWidth={1.5} /> },
]

export default function OdemeTeslimatPage() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/10 dark:to-cyan-900/10">
        <div className="container py-20 text-center lg:py-24">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wider text-emerald-800 uppercase backdrop-blur-sm dark:bg-neutral-900/60 dark:text-emerald-300">
            Müşteri Hizmetleri
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold text-neutral-900 sm:text-5xl dark:text-white">
            Ödeme & Teslimat
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">
            Güvenli ödeme, hızlı teslimat. Siparişiniz 24 saat içinde taze kavrulup kargoya verilir.
          </p>
        </div>
      </div>

      <div className="container mt-16">
        <div className="mx-auto max-w-5xl space-y-20">
          {/* Payment methods */}
          <section>
            <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Ödeme Yöntemleri</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {paymentMethods.map((m, i) => (
                <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="text-4xl">{m.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{m.name}</h3>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{m.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl"><HugeiconsIcon icon={Shield01Icon} size={24} color="currentColor" strokeWidth={1.5} /></span>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Güvenli Ödeme</h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Tüm ödemeler 256-bit SSL şifreleme ve 3D Secure ile korunur. Kart bilgileri Pure Olentia sunucularında saklanmaz — doğrudan lisanslı ödeme altyapısı (PayTR / Iyzico) üzerinden işlenir.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping zones */}
          <section>
            <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Teslimat Süreleri</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {shippingZones.map((z, i) => (
                <div key={i} className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
                  <span className="text-4xl">{z.icon}</span>
                  <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{z.zone}</h3>
                  <div className="mt-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {z.time}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Shipping cost */}
          <section>
            <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Kargo Ücretleri</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white">
                <div className="text-3xl font-bold">Ücretsiz Kargo</div>
                <p className="mt-2 text-white/80">300 TL üzeri tüm siparişlerde</p>
                <div className="mt-4 text-sm text-white/60">Abonelik siparişlerinde her zaman ücretsiz</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="text-xl font-bold text-neutral-900 dark:text-white">Standart Kargo</div>
                <p className="mt-2 text-neutral-500 dark:text-neutral-400">300 TL altı siparişlerde anlaşmalı kargo firmamızın güncel tarifesi uygulanır.</p>
                <div className="mt-4 rounded-lg bg-neutral-100 p-3 text-sm dark:bg-neutral-800">
                  <HugeiconsIcon icon={BulbIcon} size={14} color="currentColor" strokeWidth={1.5} className="inline-block" /> <strong>İpucu:</strong> 300 TL'ye tamamlayarak ücretsiz kargo kazanabilirsiniz.
                </div>
              </div>
            </div>
          </section>

          {/* Process */}
          <section>
            <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">Sipariş Süreci</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '01', title: 'Sipariş', desc: 'Ödemeniz anında onaylanır', icon: <HugeiconsIcon icon={ShoppingCart01Icon} size={24} color="currentColor" strokeWidth={1.5} /> },
                { step: '02', title: 'Kavurma', desc: '24 saat içinde taze kavrulur', icon: <HugeiconsIcon icon={Coffee01Icon} size={24} color="currentColor" strokeWidth={1.5} /> },
                { step: '03', title: 'Paketleme', desc: 'Valf kontrollü özel ambalaj', icon: <HugeiconsIcon icon={PackageIcon} size={24} color="currentColor" strokeWidth={1.5} /> },
                { step: '04', title: 'Teslimat', desc: 'Takip numarası ile kargoya verilir', icon: <HugeiconsIcon icon={DeliveryTruck01Icon} size={24} color="currentColor" strokeWidth={1.5} /> },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl bg-neutral-50 p-6 text-center dark:bg-neutral-800">
                  <span className="text-3xl">{s.icon}</span>
                  <div className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {s.step}
                  </div>
                  <h3 className="mt-3 font-semibold text-neutral-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
