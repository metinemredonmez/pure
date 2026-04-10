import CmsPage from '@/components/CmsPage'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İade & Değişim',
  description:
    'Pure Olentia iade ve değişim koşulları. Tüketici haklarınız kapsamında 14 gün içinde iade hakkı.',
}

const conditions = [
  {
    title: 'İade Süresi',
    desc: 'Ürünü teslim aldıktan sonra 14 gün içinde iade hakkınız vardır. Bu süre Mesafeli Satış Sözleşmeleri Yönetmeliği ile güvence altındadır.',
  },
  {
    title: 'Kahve Ürünleri',
    desc: 'Ambalajı açılmamış, mühürü bozulmamış kavrulmuş kahve ürünleri iade edilebilir. Ambalajı açılan kahve ürünleri hijyen ve tazelik nedeniyle iade edilemez.',
  },
  {
    title: 'Ekipmanlar',
    desc: 'Orijinal ambalajında, kullanılmamış, tüm aksesuarları tam olan ekipmanlar 14 gün içinde iade edilebilir. Kullanım belirtisi olanlar değerlendirmeye tabidir.',
  },
  {
    title: 'Abonelikler',
    desc: 'Abonelik planlarınızı istediğiniz zaman hesap panelinizden iptal edebilirsiniz. İptal sonrası o ay gönderilen siparişler iade edilebilir.',
  },
  {
    title: 'Kargo Ücreti',
    desc: 'Hatalı gönderim veya üründe kusur durumunda kargo ücreti Pure Olentia tarafından karşılanır. Cayma hakkı kullanımında iade kargo ücreti müşteriye aittir.',
  },
  {
    title: 'İade Süreci',
    desc: 'İade talebinizi info@pureolentia.com adresine sipariş numaranızla birlikte iletin. 24 saat içinde iade bilgilerini size ileteceğiz. Ürün tarafımıza ulaştıktan sonra 7 iş günü içinde ücret iadesi yapılır.',
  },
]

const steps = [
  {
    no: '1',
    title: 'Bize Ulaşın',
    desc: 'İade talebinizi info@pureolentia.com adresine iletin veya iletişim formunu kullanın.',
  },
  {
    no: '2',
    title: 'Onay Alın',
    desc: 'Ekibimiz 24 saat içinde size dönüş yaparak iade kodunuzu paylaşır.',
  },
  {
    no: '3',
    title: 'Kargoya Verin',
    desc: 'Ürünü orijinal ambalajında, iade kodu ile birlikte bize gönderin.',
  },
  {
    no: '4',
    title: 'İade Tamamlandı',
    desc: 'Ürün ulaştıktan sonra 7 iş günü içinde ücretiniz iade edilir.',
  },
]

function StaticIadeDegisimFallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl text-center lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">Müşteri Hakları</span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          İade & Değişim
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Memnuniyetiniz önceliğimizdir. Siparişinizden memnun kalmadıysanız iade koşullarımız aşağıdadır.
        </p>
      </div>

      {/* Conditions */}
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {conditions.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{c.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="mx-auto mt-20 max-w-5xl">
        <h2 className="mb-12 text-center text-2xl font-semibold text-neutral-900 dark:text-white">
          İade Adımları
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.no}
              className="rounded-2xl bg-primary-50 p-6 text-center dark:bg-primary-900/20"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-700 text-lg font-bold text-white">
                {s.no}
              </div>
              <h3 className="mt-4 font-semibold text-neutral-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto mt-16 max-w-2xl text-center">
        <p className="text-neutral-600 dark:text-neutral-400">
          İade veya değişim talebiniz için:
        </p>
        <div className="mt-6">
          <ButtonPrimary href="/contact">Bize Ulaşın</ButtonPrimary>
        </div>
      </div>
    </div>
  )
}

export default function IadeDegisimPage() {
  return (
    <CmsPage slug="iade-degisim" kicker="Müşteri Hakları" fallback={<StaticIadeDegisimFallback />} />
  )
}

