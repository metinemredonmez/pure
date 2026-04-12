import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Metadata } from 'next'
import SssFaq from './SssFaq'

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular',
  description: 'Pure Olentia kahveleri, abonelik, kargo ve daha fazlası hakkında sıkça sorulan sorular.',
}

const faqGroups = [
  {
    category: 'Sipariş & Kargo',
    icon: '📦',
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
    icon: '☕',
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
    icon: '🔄',
    accent: 'emerald',
    questions: [
      { q: 'Abonelik nasıl çalışır?', a: 'İstediğiniz planı seçin. Her ay seçtiğiniz gramajda taze kavrulmuş kahve kapınıza gelir. İstediğiniz zaman hesap panelinizden duraklatabilir veya iptal edebilirsiniz.' },
      { q: 'Aboneliği istediğim zaman iptal edebilir miyim?', a: 'Evet. Hesap panelinizden tek tıkla abonelik iptal edebilirsiniz. İptal anında aktif siparişler dışında ücret tahsil edilmez.' },
      { q: 'Abonelikte kahveyi değiştirebilir miyim?', a: 'Kesinlikle. Her ay farklı menşei denemek için plan değişikliği yapabilirsiniz veya tercihinize göre sürpriz seçimi etkinleştirebilirsiniz.' },
    ],
  },
  {
    category: 'Kurumsal & Franchise',
    icon: '🏢',
    accent: 'sky',
    questions: [
      { q: 'Kurumsal müşteriler için fiyat avantajı var mı?', a: 'Evet. Ofisiniz, restoranınız, oteliniz veya kafeniz için özel fiyatlar sunuyoruz. Detaylı teklif için B2B sayfamızdan form doldurabilirsiniz.' },
      { q: 'Franchise başvurusu nasıl yapılır?', a: 'Franchise sayfamızdaki başvuru formunu doldurun. Ekibimiz 3 iş günü içinde size dönüş yapar ve görüşme planlar.' },
      { q: 'Ekipman desteği sağlıyor musunuz?', a: 'Kurumsal müşterilerimize espresso makinesi, öğütücü ve demleme ekipmanı konusunda danışmanlık ve temin desteği sunuyoruz.' },
    ],
  },
  {
    category: 'Ödeme & Güvenlik',
    icon: '🔒',
    accent: 'violet',
    questions: [
      { q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', a: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme (bazı bölgelerde) yöntemlerini kabul ediyoruz. Tüm ödemeler SSL sertifikası ile güvence altındadır.' },
      { q: 'Kart bilgilerim güvende mi?', a: 'Kesinlikle. Kart bilgileri sitemizde saklanmaz, doğrudan lisanslı ödeme altyapısı (PayTR / Iyzico) üzerinden işlenir.' },
      { q: 'Fatura kesiliyor mu?', a: 'Her sipariş için e-fatura/e-arşiv fatura düzenlenir ve e-posta adresinize otomatik gönderilir. Kurumsal fatura talebi için sipariş sırasında vergi bilgilerini girebilirsiniz.' },
    ],
  },
]

export default function SssPage() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-amber-50 to-orange-50 dark:from-primary-900/20 dark:via-amber-900/10 dark:to-orange-900/10">
        <div className="container py-20 text-center lg:py-24">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wider text-primary-800 uppercase backdrop-blur-sm dark:bg-neutral-900/60 dark:text-primary-300">
            Yardım Merkezi
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold text-neutral-900 sm:text-5xl dark:text-white">
            Sıkça Sorulan Sorular
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">
            Pure Olentia hakkında en çok merak edilen soruların yanıtları
          </p>
        </div>
        <div className="pointer-events-none absolute -top-10 -right-10 text-9xl opacity-5 select-none">❓</div>
      </div>

      {/* Category quick links */}
      <div className="container mt-12">
        <div className="flex flex-wrap justify-center gap-3">
          {faqGroups.map((g) => (
            <a
              key={g.category}
              href={`#${g.category.toLowerCase().replace(/[^a-zçğıöşü0-9]/g, '-')}`}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <span>{g.icon}</span>
              <span>{g.category}</span>
            </a>
          ))}
        </div>
      </div>

      {/* FAQ sections */}
      <div className="container mt-16">
        <div className="mx-auto max-w-3xl space-y-12">
          {faqGroups.map((group) => (
            <section key={group.category} id={group.category.toLowerCase().replace(/[^a-zçğıöşü0-9]/g, '-')}>
              <div className="mb-6 flex items-center gap-3">
                <span className="text-3xl">{group.icon}</span>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{group.category}</h2>
              </div>
              <SssFaq questions={group.questions} />
            </section>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container mt-20">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 p-10 text-center text-white lg:p-14">
          <h2 className="text-2xl font-bold">Cevabınızı bulamadınız mı?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Ekibimiz size yardımcı olmaktan mutluluk duyar. Mesajınıza 24 saat içinde dönüş yaparız.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonPrimary href="/contact" className="!bg-white !text-primary-800 hover:!bg-white/90">
              Bize Ulaşın
            </ButtonPrimary>
            <a href="tel:+905524622954" className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium transition hover:bg-white/10">
              📞 0552 462 29 54
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
