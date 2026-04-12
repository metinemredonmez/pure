import CmsPage from '@/components/CmsPage'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kurumsal Hediye',
  description: 'Pure Olentia kurumsal hediye paketleri. Çalışanlarınıza, müşterilerinize özel kahve hediyesi.',
}

function Fallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-6xl lg:my-24">
        {/* Two-column layout: text left, image right */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Text content */}
          <div>
            <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">Kurumsal</span>
            <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
              Kurumsal Hediye Paketleri
            </h1>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
              Çalışanlarınız, müşterileriniz ve iş ortaklarınız için unutulmaz kahve hediyeleri.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                'Taze kavrulmuş specialty kahve',
                'Özel tasarım kutu ve ambalaj',
                'Şirket logonuzla markalama imkanı',
                'Toplu sipariş avantajı',
                'Türkiye geneline hızlı teslimat',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonPrimary href="/contact">Teklif Alın</ButtonPrimary>
              <a
                href="tel:+905524622954"
                className="flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300"
              >
                0552 462 29 54
              </a>
            </div>
          </div>

          {/* Right: Image area (admin can replace via CMS) */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-800">
            <Image
              src="/hero/hediye-paketi.jpg"
              alt="Pure Olentia Kurumsal Hediye Paketi"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Options */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-semibold text-neutral-900 dark:text-white">
            Hediye Seçenekleri
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Klasik Set', desc: 'Türk Kahvesi 100gr + cezve + fincan' },
              { name: 'Premium Set', desc: '3 farklı menşei + demleme rehberi' },
              { name: 'Gourmet Set', desc: 'Blend + ekipman + workshop davetiyesi' },
              { name: 'Özel Tasarım', desc: 'Talebinize göre özel paket' },
            ].map((opt, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 p-6 text-center transition hover:border-primary-300 hover:shadow-md dark:border-neutral-700"
              >
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{opt.name}</h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KurumsalHediyePage() {
  return <CmsPage slug="kurumsal-hediye" kicker="Kurumsal" fallback={<Fallback />} />
}
