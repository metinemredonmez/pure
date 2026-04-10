import CmsPage from '@/components/CmsPage'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular',
  description: 'Pure Olentia kahveleri, abonelik, kargo ve daha fazlası hakkında sıkça sorulan sorular.',
}

const faqGroups = [
  {
    category: 'Sipariş & Kargo',
    questions: [
      {
        q: 'Siparişim ne zaman elime ulaşır?',
        a: 'Siparişiniz sonrası kahveniz 24 saat içinde taze kavrulup kargoya verilir. İstanbul içi ortalama 1 iş günü, Türkiye geneli 1-3 iş günü içinde teslim edilir.',
      },
      {
        q: 'Kargo ücreti ne kadar?',
        a: '300 TL üzeri siparişlerde kargo ücretsizdir. Bu tutarın altında standart kargo ücreti alınır. Abonelik siparişlerinde tüm kargolar ücretsizdir.',
      },
      {
        q: 'Siparişimi nasıl takip edebilirim?',
        a: 'Sipariş onayından sonra e-posta ile kargo takip numaranız size iletilir. Ayrıca "Sipariş Takibi" sayfamızdan sipariş numaranızla da sorgulama yapabilirsiniz.',
      },
      {
        q: 'Yurt dışına gönderim yapıyor musunuz?',
        a: 'Şu anda sadece Türkiye geneline gönderim yapıyoruz. Yurt dışı siparişleri için özel talep oluşturabilirsiniz (info@pureolentia.com).',
      },
    ],
  },
  {
    category: 'Kahve & Tazelik',
    questions: [
      {
        q: 'Kahveleriniz ne kadar taze?',
        a: 'Tüm kahvelerimiz sipariş sonrası kavrulur. Ambalaj üzerinde kavurma tarihi yer alır. İdeal tüketim süresi kavurma tarihinden itibaren 4 hafta içindedir.',
      },
      {
        q: 'Kahveyi nasıl saklamalıyım?',
        a: 'Serin, kuru, ışıksız bir yerde, hava almayan kapta saklayın. Buzdolabında saklamayın (nem aroma kaybına sebep olur). Öğütülmüş kahveyi 2 hafta içinde tüketin.',
      },
      {
        q: 'Öğütülmüş mü çekirdek mi almalıyım?',
        a: 'Mümkünse her zaman çekirdek alın ve demleme öncesi öğütün. Eğer öğütücünüz yoksa kullandığınız ekipmana uygun öğütme seçeneği ile sipariş verebilirsiniz.',
      },
      {
        q: 'Kahvelerin izlenebilirliği nasıl?',
        a: 'Her paketimizde menşei, bölge, yükseklik, işleme yöntemi ve kavurma tarihi yer alır. Doğrudan ticaret (direct trade) ile çalıştığımız çiftçiler her çekirdeğin kaynağını teyit eder.',
      },
    ],
  },
  {
    category: 'Abonelik',
    questions: [
      {
        q: 'Abonelik nasıl çalışır?',
        a: 'İstediğiniz planı seçin. Her ay seçtiğiniz gramajda taze kavrulmuş kahve kapınıza gelir. İstediğiniz zaman hesap panelinizden duraklatabilir veya iptal edebilirsiniz.',
      },
      {
        q: 'Aboneliği istediğim zaman iptal edebilir miyim?',
        a: 'Evet. Hesap panelinizden tek tıkla abonelik iptal edebilirsiniz. İptal anında aktif siparişler dışında ücret tahsil edilmez.',
      },
      {
        q: 'Abonelikte kahveyi değiştirebilir miyim?',
        a: 'Kesinlikle. Her ay farklı menşei denemek için plan değişikliği yapabilirsiniz veya tercihinize göre sürpriz seçimi etkinleştirebilirsiniz.',
      },
    ],
  },
  {
    category: 'Kurumsal & Franchise',
    questions: [
      {
        q: 'Kurumsal müşteriler için fiyat avantajı var mı?',
        a: 'Evet. Ofisiniz, restoranınız, oteliniz veya kafeniz için özel fiyatlar sunuyoruz. Detaylı teklif için B2B sayfamızdan form doldurabilirsiniz.',
      },
      {
        q: 'Franchise başvurusu nasıl yapılır?',
        a: 'Franchise sayfamızdaki başvuru formunu doldurun. Ekibimiz 3 iş günü içinde size dönüş yapar ve görüşme planlar.',
      },
      {
        q: 'Ekipman desteği sağlıyor musunuz?',
        a: 'Kurumsal müşterilerimize espresso makinesi, öğütücü ve demleme ekipmanı konusunda danışmanlık ve temin desteği sunuyoruz.',
      },
    ],
  },
  {
    category: 'Ödeme & Güvenlik',
    questions: [
      {
        q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
        a: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme (bazı bölgelerde) yöntemlerini kabul ediyoruz. Tüm ödemeler SSL sertifikası ile güvence altındadır.',
      },
      {
        q: 'Kart bilgilerim güvende mi?',
        a: 'Kesinlikle. Kart bilgileri sitemizde saklanmaz, doğrudan lisanslı ödeme altyapısı (PayTR / Iyzico) üzerinden işlenir.',
      },
      {
        q: 'Fatura kesiliyor mu?',
        a: 'Her sipariş için e-fatura/e-arşiv fatura düzenlenir ve e-posta adresinize otomatik gönderilir. Kurumsal fatura talebi için sipariş sırasında vergi bilgilerini girebilirsiniz.',
      },
    ],
  },
]

function StaticFaqFallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl text-center lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">Yardım Merkezi</span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Sıkça Sorulan Sorular
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Pure Olentia hakkında en çok merak edilen soruların yanıtları.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-12">
        {faqGroups.map((group) => (
          <section key={group.category}>
            <h2 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">{group.category}</h2>
            <div className="space-y-3">
              {group.questions.map((item, idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-primary-300 open:border-primary-500 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-left text-base font-semibold text-neutral-900 dark:text-white">
                    <span className="pr-4">{item.q}</span>
                    <svg
                      className="h-5 w-5 shrink-0 transition group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mx-auto mt-20 max-w-2xl rounded-3xl bg-primary-50 p-10 text-center dark:bg-primary-900/20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">Cevabınızı bulamadınız mı?</h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Ekibimiz size yardımcı olmaktan mutluluk duyar.
        </p>
        <div className="mt-8">
          <ButtonPrimary href="/contact">Bize Ulaşın</ButtonPrimary>
        </div>
      </div>
    </div>
  )
}

export default function SssPage() {
  return <CmsPage slug="sss" kicker="Yardım Merkezi" fallback={<StaticFaqFallback />} />
}
