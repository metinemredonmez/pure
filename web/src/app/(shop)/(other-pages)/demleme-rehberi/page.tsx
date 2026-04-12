import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demleme Rehberi',
  description:
    'Pure Olentia demleme rehberi: V60, Chemex, French Press, Aeropress, Moka Pot, Cezve ile adım adım tarifler.',
}

interface BrewMethod {
  name: string
  icon: string
  accent: string
  ratio: string
  grind: string
  temp: string
  time: string
  description: string
  steps: string[]
  tip: string
}

const methods: BrewMethod[] = [
  {
    name: 'V60 (Pour-over)',
    icon: '▽',
    accent: 'amber',
    ratio: '15g / 250ml (1:16)',
    grind: 'Orta-ince',
    temp: '92-94°C',
    time: '2:30 - 3:00',
    description:
      'Japonya kökenli koni filtre. Kahvenin aroma notalarını en net şekilde ortaya çıkarır. Tek menşeili açık kavrumlar için ideal.',
    steps: [
      'Filtre kağıdını ıslatın, ibriği ısıtın.',
      'Kahveyi filtreye koyun, ortasında çukur oluşturun.',
      'Bloom: 30ml su ile 30 saniye bekletin.',
      'Merkezden dışa spiral hareketlerle 100ml dökün.',
      '1:15\'te 150ml daha ekleyin, toplam 250ml.',
      'Suyun tamamen süzülmesini bekleyin.',
    ],
    tip: 'Çok ince öğütme acı, çok kaba öğütme sulu sonuç verir. İlk deneme orta-ince ile başlayın.',
  },
  {
    name: 'Chemex',
    icon: '⧖',
    accent: 'orange',
    ratio: '30g / 500ml (1:17)',
    grind: 'Orta',
    temp: '92-94°C',
    time: '4:00 - 5:00',
    description:
      'Kalın kağıt filtresi sayesinde temiz, berrak ve yumuşak içimli kahve. Cam karafıyla hem demleme hem servis aracı.',
    steps: [
      'Chemex filtresini ıslatın (katlı kısım oluğun önünde).',
      'Kahveyi ekleyin.',
      'Bloom: 60ml su, 45 saniye.',
      'Spiral hareketlerle 200ml\'ye kadar dökün.',
      'Su çekildikçe kademeli olarak 500ml\'ye tamamlayın.',
      'Toplam süre 4-5 dakika.',
    ],
    tip: 'Chemex filtresi standart V60 filtresinden 2 kat kalın — bu yüzden daha kaba öğütme gerektirir.',
  },
  {
    name: 'French Press',
    icon: '⬢',
    accent: 'stone',
    ratio: '30g / 500ml (1:15)',
    grind: 'İri',
    temp: '95°C',
    time: '4 dakika',
    description:
      'Klasik daldırma yöntemi. Kahvenin tüm yağlarını fincana taşır, yoğun gövdeli ve doyurucu bir içim. En kolay ve ekonomik yöntem.',
    steps: [
      'French Press\'i sıcak suyla ısıtın.',
      'Kahveyi ekleyin.',
      'Suyun tamamını hızlıca dökün.',
      '30 saniye sonra crust\'u bir kaşıkla karıştırın.',
      '4 dakika bekleyin.',
      'Pistonu yavaşça bastırın.',
      'Hemen servis edin — bekleme acılaştırır.',
    ],
    tip: 'İri öğütme şart. İnce öğütme hem acı kahveye hem de pistonun zor inmesine neden olur.',
  },
  {
    name: 'Aeropress',
    icon: '⌘',
    accent: 'emerald',
    ratio: '15g / 220ml (1:14)',
    grind: 'Orta-ince',
    temp: '85-92°C',
    time: '2 dakika',
    description:
      'Basınç ve daldırmayı birleştiren hibrit yöntem. Kompakt, hızlı ve seyahat dostu. Yüzlerce tarif ile kişiselleştirilebilir.',
    steps: [
      'Aeropress\'i ters modda (inverted) kurun.',
      'Kahveyi ekleyin, 50ml su dökün, 30 saniye bekleyin.',
      'Geri kalan suyu ekleyin, 10 saniye karıştırın.',
      'Filtre kapağını kapatın, bardağa çevirin.',
      '30 saniyede yavaşça bastırın.',
    ],
    tip: 'Ters mod (inverted) kullanarak erken damlama sorununu çözersiniz. Dikkatli çevirin, sıcak su var!',
  },
  {
    name: 'Moka Pot',
    icon: '⬣',
    accent: 'rose',
    ratio: 'Hazneyi tama doldurun',
    grind: 'İnce (espressodan biraz kaba)',
    temp: 'Orta ateş',
    time: '4-5 dakika',
    description:
      'İtalya\'nın klasiği. Ocak üstünde çalışan, espressoya en yakın sonucu veren ekonomik çözüm. Evde yoğun kahve isteyenler için ideal.',
    steps: [
      'Alt hazneye sıcak su doldurun (valfe kadar).',
      'Filtre sepetini kahveyle doldurun (sıkıştırmayın).',
      'Üst hazneyi sıkıca vidalayın.',
      'Orta ateşe koyun.',
      'Gur gur sesi başladığında ocaktan alın.',
      'Alt hazneyi musluk suyuyla soğutun (fazla pişmeyi önler).',
    ],
    tip: 'Alt hazneye soğuk su değil, sıcak su koyun — kahve yanmaz ve daha temiz tat alırsınız.',
  },
  {
    name: 'Cezve (Türk Kahvesi)',
    icon: '◈',
    accent: 'amber',
    ratio: '1 fincan su + 1.5 tatlı kaşığı',
    grind: 'Toz kadar ince',
    temp: 'Düşük ateş',
    time: '4-5 dakika',
    description:
      'UNESCO somut olmayan kültürel miras listesindeki geleneksel yöntem. Çok ince öğütülmüş kahveyle, düşük ateşte, sabırla hazırlanır.',
    steps: [
      'Suyu cezveye koyun.',
      'Kahveyi ve şekeri ekleyin (tercih ettiğiniz sertlikte).',
      'Karıştırın, düşük ateşe koyun.',
      'Köpüklenmeye başladığında karıştırmayı bırakın.',
      'Köpük yükseldiğinde ocaktan alın.',
      'Köpüğü fincanlara dağıtın, cezveyi tekrar ateşe koyun.',
      'Bir kez daha kabardığında fincanlara dökün.',
    ],
    tip: 'Türk kahvesi asla kaynamalı. Köpük yükselir yükselmez ocaktan alın — kaynama lezzeti öldürür.',
  },
]

const accentStyles: Record<string, { bg: string; icon: string; border: string }> = {
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    icon: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
  },
  stone: {
    bg: 'bg-stone-50 dark:bg-stone-900/20',
    icon: 'bg-stone-200 text-stone-700 dark:bg-stone-800/50 dark:text-stone-300',
    border: 'border-stone-200 dark:border-stone-800',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    icon: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
}

export default function DemlemeRehberiPage() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-amber-50 to-orange-50 dark:from-primary-900/20 dark:via-amber-900/10 dark:to-orange-900/10">
        <div className="container py-20 text-center lg:py-28">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wider text-primary-800 uppercase backdrop-blur-sm dark:bg-neutral-900/60 dark:text-primary-300">
            Adım Adım Tarifler
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
            Demleme Rehberi
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Her ekipmanın kendine özgü bir dili var. Pure Olentia barista ekibimizin hazırladığı rehberle kahvenizin tam
            potansiyelini ortaya çıkarın.
          </p>
        </div>
        <div className="pointer-events-none absolute -top-10 -right-10 text-9xl opacity-10 select-none">☕</div>
      </div>

      {/* Quick reference cards */}
      <div className="container mt-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((m) => {
            const style = accentStyles[m.accent] || accentStyles.amber
            return (
              <a
                key={m.name}
                href={`#${m.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                className={`flex items-center gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${style.bg} ${style.border}`}
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${style.icon}`}>
                  {m.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{m.name}</h3>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {m.ratio} · {m.time}
                  </p>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {/* Detailed method sections */}
      <div className="container mt-24 space-y-24">
        {methods.map((m) => {
          const style = accentStyles[m.accent] || accentStyles.amber
          const anchor = m.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
          return (
            <section key={m.name} id={anchor} className="scroll-mt-20">
              <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-5">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl ${style.icon}`}>
                    {m.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{m.name}</h2>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">{m.description}</p>
                  </div>
                </div>

                {/* Specs grid */}
                <div className={`mt-8 grid grid-cols-2 gap-4 rounded-2xl p-6 sm:grid-cols-4 ${style.bg}`}>
                  <div>
                    <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Oran</div>
                    <div className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">{m.ratio}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Öğütme</div>
                    <div className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">{m.grind}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Su Sıcaklığı</div>
                    <div className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">{m.temp}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Süre</div>
                    <div className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">{m.time}</div>
                  </div>
                </div>

                {/* Steps */}
                <div className="mt-8">
                  <h3 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-white">Adım Adım</h3>
                  <ol className="space-y-4">
                    {m.steps.map((step, i) => (
                      <li key={i} className="flex gap-4">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${style.icon}`}
                        >
                          {i + 1}
                        </div>
                        <p className="pt-1 text-neutral-700 dark:text-neutral-300">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Pro tip */}
                <div className={`mt-8 rounded-2xl border-l-4 p-5 ${style.bg} ${style.border}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    💡 Pro İpucu
                  </div>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{m.tip}</p>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* CTA */}
      <div className="container mt-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 p-12 text-center text-white lg:p-16">
          <div className="pointer-events-none absolute -top-8 -right-8 text-[160px] opacity-10 select-none">☕</div>
          <h2 className="text-3xl font-bold">Hangi demleme yöntemini denemeliyim?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            İlk kez specialty kahve deniyorsanız V60 veya French Press ile başlamanızı öneriyoruz. Sorularınız için bize
            ulaşın.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonPrimary href="/contact" className="!bg-white !text-primary-800 hover:!bg-white/90">
              Bize Ulaşın
            </ButtonPrimary>
            <ButtonPrimary href="/ekipmanlar" className="!border !border-white/30 !bg-transparent hover:!bg-white/10">
              Ekipman Rehberi
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  )
}
