import { CoffeeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import CmsPage from '@/components/CmsPage'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ekipmanlar',
  description:
    'Specialty kahve demleme ekipmanları rehberi: V60, Chemex, French Press, Aeropress, Moka Pot, Cezve ve daha fazlası.',
}

interface EquipmentItem {
  name: string
  description: string
  bestFor: string
  grind: string
  ratio: string
  icon: string // emoji or svg
  accent: string // tailwind color class
}

interface EquipmentGroup {
  category: string
  subtitle: string
  items: EquipmentItem[]
}

const equipmentGroups: EquipmentGroup[] = [
  {
    category: 'Filtre Kahve',
    subtitle: 'Aromayı öne çıkaran manuel demleme',
    items: [
      {
        name: 'Hario V60',
        description:
          'Japonya kökenli koni filtre. Kahvenin aroma notalarını en net şekilde ortaya çıkarır. Yeni başlayanlar için ideal ama detaylara hâkim barista için de derin kontrol sunar.',
        bestFor: 'Hafif kavrumlar, Etiyopya, Kenya',
        grind: 'Orta-ince',
        ratio: '1:16',
        icon: '▽',
        accent: 'amber',
      },
      {
        name: 'Chemex',
        description:
          'Kalın kağıt filtresi sayesinde temiz, berrak ve yumuşak içimli bir kahve elde etmenizi sağlar. Cam karafıyla da servis için estetik bir seçim.',
        bestFor: 'Meyveli ve çiçeksi kahveler',
        grind: 'Orta',
        ratio: '1:17',
        icon: '⧖',
        accent: 'orange',
      },
      {
        name: 'Kalita Wave',
        description:
          'Düz tabanlı ve üç delikli yapısıyla tutarlı demleme sağlar. Su akışını daha eşit dağıtır, tutarlılık önemliyse mükemmel seçim.',
        bestFor: 'Orta kavrumlar, dengeli profiller',
        grind: 'Orta',
        ratio: '1:16',
        icon: '⬡',
        accent: 'yellow',
      },
    ],
  },
  {
    category: 'Daldırma (Immersion)',
    subtitle: 'Yoğun gövdeli, zengin içim',
    items: [
      {
        name: 'French Press',
        description:
          'Klasik daldırma yöntemi. Kahvenin tüm yağlarını fincana taşır, yoğun gövdeli ve doyurucu bir içim sunar. En kolay ve ekonomik yöntemlerden biri.',
        bestFor: 'Koyu kavrumlar, Brezilya, Guatemala',
        grind: 'İri',
        ratio: '1:15',
        icon: '⬢',
        accent: 'stone',
      },
      {
        name: 'Aeropress',
        description:
          'Basınç ve daldırmayı birleştiren hibrit yöntem. Kompakt, hızlı ve seyahat dostu. Yüzlerce tarif ile kişiselleştirilebilir.',
        bestFor: 'Tek fincan demleme, yolda',
        grind: 'İnce - orta',
        ratio: '1:14',
        icon: '⌘',
        accent: 'emerald',
      },
    ],
  },
  {
    category: 'Espresso ve Türk Kahvesi',
    subtitle: 'Geleneksel ve modern basınçlı demleme',
    items: [
      {
        name: 'Espresso Makinesi',
        description:
          'Yüksek basınçla (9 bar) kısa sürede yoğun kahve ekstraksiyonu. Ev baristası için pro-sumer makineler veya ticari kullanım için komple ekipman.',
        bestFor: 'Espresso, Latte, Cappuccino',
        grind: 'Çok ince',
        ratio: '1:2',
        icon: '☕',
        accent: 'red',
      },
      {
        name: 'Moka Pot',
        description:
          "İtalya'nın klasiği. Ocak üstünde çalışan, espressoya en yakın sonucu veren ekonomik çözüm. Evde yoğun kahve isteyenler için.",
        bestFor: 'Güçlü, koyu içimler',
        grind: 'İnce',
        ratio: '1:10',
        icon: '⬣',
        accent: 'rose',
      },
      {
        name: 'Cezve (Türk Kahvesi)',
        description:
          'Geleneksel yöntem. Çok ince öğütülmüş kahveyle, düşük ateşte, sabırla hazırlanır. Bakır veya paslanmaz çelik cezve tavsiye edilir.',
        bestFor: 'Geleneksel Türk Kahvesi',
        grind: 'Toz ince',
        ratio: '1 fincan: 1 tatlı kaşığı',
        icon: '◈',
        accent: 'amber',
      },
    ],
  },
  {
    category: 'Yardımcı Ekipmanlar',
    subtitle: 'Her baristanın olmazsa olmazı',
    items: [
      {
        name: 'Kahve Öğütücü',
        description:
          'İyi bir öğütücü, kahve makinesinden önce gelir. Burr (konik) öğütücü alın; tutarlı öğütme boyutu aromaya doğrudan etki eder. Taze öğütme = taze aroma.',
        bestFor: 'Tüm demleme yöntemleri',
        grind: '—',
        ratio: '—',
        icon: '⚙',
        accent: 'neutral',
      },
      {
        name: 'Hassas Terazi',
        description:
          '0.1g hassasiyetinde dijital terazi. Su ve kahve oranını doğru tutmak için şart. İyi kahve = tutarlı ölçü.',
        bestFor: 'Tutarlılık',
        grind: '—',
        ratio: '—',
        icon: '⚖',
        accent: 'sky',
      },
      {
        name: 'Kuğu Boyunlu Su Isıtıcı',
        description:
          'Su akışını hassas kontrol eder. Pour-over yöntemlerinde olmazsa olmaz. Sıcaklık kontrolü olan modeller tercih edilmeli (92-96°C).',
        bestFor: 'V60, Chemex, Kalita',
        grind: '—',
        ratio: '—',
        icon: '♨',
        accent: 'teal',
      },
    ],
  },
]

// Map category to a hero-style summary card
const categoryIcons: Record<string, { icon: string; gradient: string }> = {
  'Filtre Kahve': { icon: '▽', gradient: 'from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20' },
  'Daldırma (Immersion)': {
    icon: '⬢',
    gradient: 'from-emerald-50 to-stone-100 dark:from-emerald-900/20 dark:to-stone-900/20',
  },
  'Espresso ve Türk Kahvesi': {
    icon: '☕',
    gradient: 'from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20',
  },
  'Yardımcı Ekipmanlar': { icon: '⚙', gradient: 'from-sky-50 to-teal-100 dark:from-sky-900/20 dark:to-teal-900/20' },
}

const accentBg: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  stone: 'bg-stone-200 text-stone-700 dark:bg-stone-800/50 dark:text-stone-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  neutral: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

function StaticEkipmanlarFallback() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-amber-50 to-orange-100 dark:from-primary-900/20 dark:via-amber-900/10 dark:to-orange-900/20">
        <div className="container py-20 text-center lg:py-28">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wider text-primary-800 uppercase backdrop-blur-sm dark:bg-neutral-900/60 dark:text-primary-300">
            Ekipman Rehberi
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            Kahve Ekipmanları
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Her demleme yönteminin kendine özgü bir dili vardır. Doğru ekipmanla kahvenizin karakterini ortaya
            çıkarabilirsiniz. Pure Olentia barista ekibinin hazırladığı rehberle size en uygun ekipmanı seçin.
          </p>
        </div>
        {/* decorative coffee beans */}
        <div className="pointer-events-none absolute -top-10 -right-10 opacity-10 select-none"><HugeiconsIcon icon={CoffeeIcon} size={120} color="currentColor" strokeWidth={1} /></div>
        <div className="pointer-events-none absolute -bottom-10 -left-10 text-9xl opacity-10 select-none">⬢</div>
      </div>

      {/* Category summary cards */}
      <div className="container mt-16 lg:mt-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {equipmentGroups.map((group) => {
            const meta = categoryIcons[group.category] || categoryIcons['Filtre Kahve']
            return (
              <div
                key={group.category}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${meta.gradient} p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md`}
              >
                <div className="text-5xl">{meta.icon}</div>
                <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{group.category}</h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{group.subtitle}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item.name}
                      className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-neutral-700 backdrop-blur-sm dark:bg-neutral-900/60 dark:text-neutral-300"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed equipment sections */}
      <div className="container mt-24 space-y-20">
        {equipmentGroups.map((group) => (
          <section key={group.category}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{group.category}</h2>
              <p className="mt-3 text-neutral-500 dark:text-neutral-400">{group.subtitle}</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className="group relative flex flex-col rounded-3xl border border-neutral-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110 ${accentBg[item.accent] || accentBg.neutral}`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-neutral-900 dark:text-white">{item.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </p>
                  <dl className="mt-6 space-y-2 border-t border-neutral-100 pt-5 text-xs dark:border-neutral-800">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-neutral-400">Uygun</dt>
                      <dd className="text-right font-medium text-neutral-800 dark:text-neutral-200">{item.bestFor}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-neutral-400">Öğütme</dt>
                      <dd className="text-right font-medium text-neutral-800 dark:text-neutral-200">{item.grind}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-neutral-400">Oran</dt>
                      <dd className="text-right font-medium text-neutral-800 dark:text-neutral-200">{item.ratio}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="container mt-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 p-12 text-center text-white lg:p-16">
          <div className="pointer-events-none absolute -top-8 -right-8 opacity-10 select-none"><HugeiconsIcon icon={CoffeeIcon} size={140} color="currentColor" strokeWidth={1} /></div>
          <h2 className="text-3xl font-bold">Hangi ekipmana ihtiyacınız olduğundan emin değil misiniz?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Bize yazın, damak tadınıza ve bütçenize göre öneride bulunalım. Pure Olentia barista ekibi her zaman
            yanınızda.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary-800 shadow-lg transition hover:bg-neutral-100">
              Bize Ulaşın
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <CmsPage
      slug="ekipmanlar"
      kicker="Kahve Dünyası"
      fallback={<StaticEkipmanlarFallback />}
    />
  )
}
