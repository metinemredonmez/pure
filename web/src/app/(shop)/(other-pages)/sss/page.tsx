import { PackageIcon, CoffeeIcon, ReturnRequestIcon, Building02Icon, Shield01Icon, HelpCircleIcon, CallIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'
import SssFaq from './SssFaq'

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular',
  description: 'Pure Olentia kahveleri, abonelik, kargo ve daha fazlası hakkında sıkça sorulan sorular.',
}

const faqGroupIcons: Record<string, React.ReactNode> = {
  'Sipariş & Kargo': <HugeiconsIcon icon={PackageIcon} size={24} color="currentColor" strokeWidth={1.5} />,
  'Kahve & Tazelik': <HugeiconsIcon icon={CoffeeIcon} size={24} color="currentColor" strokeWidth={1.5} />,
  'Abonelik': <HugeiconsIcon icon={ReturnRequestIcon} size={24} color="currentColor" strokeWidth={1.5} />,
  'Kurumsal & Franchise': <HugeiconsIcon icon={Building02Icon} size={24} color="currentColor" strokeWidth={1.5} />,
  'Ödeme & Güvenlik': <HugeiconsIcon icon={Shield01Icon} size={24} color="currentColor" strokeWidth={1.5} />,
}

const faqGroups = [
  {
    category: 'Sipariş & Kargo',
    accent: 'amber',
    questions: [
      { q: 'Siparişim ne zaman elime ulaşır?', a: 'Siparişiniz sonrası kahveniz 24 saat içinde taze kavrulup kargoya verilir. İstanbul içi ortalama 1 iş günü, Türkiye geneli 1-3 iş günü içinde teslim edilir.' },
      { q: 'Kargo ücreti ne kadar?', a: '300 TL üzeri siparişlerde kargo ücretsizdir. Bu tutarın altında standart kargo ücreti alınır. Abonelik siparişlerinde tüm kargolar ücretsizdir.' },
      { q: 'Siparişimi nasıl takip edebilirim?', a: 'Sipariş onayından sonra e-posta ile kargo takip numaranız size iletilir. Ayrıca "Sipariş Takibi" sayfamızdan sipariş numaranızla da sorgulama yapabilirsiniz.' },
      { q: 'Yurt dışına gönderim yapıyor musunuz?', a: 'Şu anda sadece Türkiye geneline gönderim yapıyoruz. Yurt dışı siparişleri için özel talep oluşturabilirsiniz (info@pureolentia.com).' },
    ],
  },
  {
    category: 'Kahve & Tazelik',
    accent: 'primary',
    questions: [
      { q: 'Kahveleriniz ne kadar taze?', a: 'Tüm kahvelerimiz sipariş sonrası kavrulur. Ambalaj üzerinde kavurma tarihi yer alır. İdeal tüketim süresi kavurma tarihinden itibaren 4 hafta içindedir.' },
      { q: 'Kahveyi nasıl saklamalıyım?', a: 'Serin, kuru, ışıksız bir yerde, hava almayan kapta saklayın. Buzdolabında saklamayın (nem aroma kaybına sebep olur). Öğütülmüş kahveyi 2 hafta içinde tüketin.' },
      { q: 'Öğütülmüş mü çekirdek mi almalıyım?', a: 'Mümkünse her zaman çekirdek alın ve demleme öncesi öğütün. Eğer öğütücünüz yoksa kullandığınız ekipmana uygun öğütme seçeneği ile sipariş verebilirsiniz.' },
      { q: 'Kahvelerin izlenebilirliği nasıl?', a: 'Her paketimizde menşei, bölge, yükseklik, işleme yöntemi ve kavurma tarihi yer alır. Doğrudan ticaret (direct trade) ile çalıştığımız çiftçiler her çekirdeğin kaynağını teyit eder.' },
    ],
  },
  {
    category: 'Abonelik',
    accent: 'emerald',
    questions: [
      { q: 'Abonelik nasıl çalışır?', a: 'İstediğiniz planı seçin. Her ay seçtiğiniz gramajda taze kavrulmuş kahve kapınıza gelir. İstediğiniz zaman hesap panelinizden duraklatabilir veya iptal edebilirsiniz.' },
      { q: 'Aboneliği istediğim zaman iptal edebilir miyim?', a: 'Evet. Hesap panelinizden tek tıkla abonelik iptal edebilirsiniz. İptal anında aktif siparişler dışında ücret tahsil edilmez.' },
      { q: 'Abonelikte kahveyi değiştirebilir miyim?', a: 'Kesinlikle. Her ay farklı menşei denemek için plan değişikliği yapabilirsiniz veya tercihinize göre sürpriz seçimi etkinleştirebilirsiniz.' },
    ],
  },
  {
    category: 'Kurumsal & Franchise',
    accent: 'sky',
    questions: [
      { q: 'Kurumsal müşteriler için fiyat avantajı var mı?', a: 'Evet. Ofisiniz, restoranınız, oteliniz veya kafeniz için özel fiyatlar sunuyoruz. Detaylı teklif için B2B sayfamızdan form doldurabilirsiniz.' },
      { q: 'Franchise başvurusu nasıl yapılır?', a: 'Franchise sayfamızdaki başvuru formunu doldurun. Ekibimiz 3 iş günü içinde size dönüş yapar ve görüşme planlar.' },
      { q: 'Ekipman desteği sağlıyor musunuz?', a: 'Kurumsal müşterilerimize espresso makinesi, öğütücü ve demleme ekipmanı konusunda danışmanlık ve temin desteği sunuyoruz.' },
    ],
  },
  {
    category: 'Ödeme & Güvenlik',
    accent: 'violet',
    questions: [
      { q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', a: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme (bazı bölgelerde) yöntemlerini kabul ediyoruz. Tüm ödemeler SSL sertifikası ile güvence altındadır.' },
      { q: 'Kart bilgilerim güvende mi?', a: 'Kesinlikle. Kart bilgileri sitemizde saklanmaz, doğrudan lisanslı ödeme altyapısı (PayTR / Iyzico) üzerinden işlenir.' },
      { q: 'Fatura kesiliyor mu?', a: 'Her sipariş için e-fatura/e-arşiv fatura düzenlenir ve e-posta adresinize otomatik gönderilir. Kurumsal fatura talebi için sipariş sırasında vergi bilgilerini girebilirsiniz.' },
    ],
  },
]

function Fallback() {
  return (
    <div className="container pb-24 pt-16 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">Sıkça Sorulan Sorular</h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">
          Bu sayfanın içeriği admin panelinden yönetilmektedir. Eğer içerik görünmüyorsa lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="sss" kicker="Sıkça Sorulanlar" fallback={<Fallback />} />
}
