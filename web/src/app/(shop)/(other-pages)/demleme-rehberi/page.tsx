import { CoffeeIcon, BulbIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

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

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Demleme Rehberi</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir. Eğer içerik görünmüyorsa lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="demleme-rehberi" kicker="Kahve Dünyası" fallback={<Fallback />} />
}
