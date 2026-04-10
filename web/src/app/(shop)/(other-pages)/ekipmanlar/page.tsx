import CmsPage from '@/components/CmsPage'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ekipmanlar',
  description:
    'Specialty kahve demleme ekipmanları rehberi: V60, Chemex, French Press, Aeropress, Moka Pot, Cezve ve daha fazlası.',
}

const equipmentGroups = [
  {
    category: 'Filtre Kahve Ekipmanları',
    items: [
      {
        name: 'Hario V60',
        description:
          'Japonya kökenli koni filtre. Kahvenin aroma notalarını en net şekilde ortaya çıkarır. Yeni başlayanlar için ideal ama detaylara hâkim barista için de derin kontrol sunar.',
        bestFor: 'Hafif kavrumlar, Etiyopya, Kenya',
        grind: 'Orta-ince',
        ratio: '1:16',
      },
      {
        name: 'Chemex',
        description:
          'Kalın kağıt filtresi sayesinde temiz, berrak ve yumuşak içimli bir kahve elde etmenizi sağlar. Cam karafıyla da servis için estetik bir seçim.',
        bestFor: 'Meyveli ve çiçeksi kahveler',
        grind: 'Orta',
        ratio: '1:17',
      },
      {
        name: 'Kalita Wave',
        description:
          'Düz tabanlı ve üç delikli yapısıyla tutarlı demleme sağlar. Su akışını daha eşit dağıtır, tutarlılık önemliyse mükemmel seçim.',
        bestFor: 'Orta kavrumlar, dengeli profiller',
        grind: 'Orta',
        ratio: '1:16',
      },
    ],
  },
  {
    category: 'Daldırma (Immersion) Ekipmanları',
    items: [
      {
        name: 'French Press',
        description:
          'Klasik daldırma yöntemi. Kahvenin tüm yağlarını fincana taşır, yoğun gövdeli ve doyurucu bir içim sunar. En kolay ve ekonomik yöntemlerden biri.',
        bestFor: 'Koyu kavrumlar, Brezilya, Guatemala',
        grind: 'İri',
        ratio: '1:15',
      },
      {
        name: 'Aeropress',
        description:
          'Basınç ve daldırmayı birleştiren hibrit yöntem. Kompakt, hızlı ve seyahat dostu. Yüzlerce tarif ile kişiselleştirilebilir.',
        bestFor: 'Tek fincan demleme, yolda',
        grind: 'İnce - orta',
        ratio: '1:14',
      },
    ],
  },
  {
    category: 'Espresso ve Türk Kahvesi',
    items: [
      {
        name: 'Espresso Makinesi',
        description:
          'Yüksek basınçla (9 bar) kısa sürede yoğun kahve ekstraksiyonu. Ev baristası için pro-sumer makineler veya ticari kullanım için komple ekipman.',
        bestFor: 'Espresso, Latte, Cappuccino',
        grind: 'Çok ince',
        ratio: '1:2',
      },
      {
        name: 'Moka Pot',
        description:
          'İtalya\'nın klasiği. Ocak üstünde çalışan, espressoya en yakın sonucu veren ekonomik çözüm. Evde yoğun kahve isteyenler için.',
        bestFor: 'Güçlü, koyu içimler',
        grind: 'İnce',
        ratio: '1:10',
      },
      {
        name: 'Cezve (Türk Kahvesi)',
        description:
          'Geleneksel yöntem. Çok ince öğütülmüş kahveyle, düşük ateşte, sabırla hazırlanır. Bakır veya paslanmaz çelik cezve tavsiye edilir.',
        bestFor: 'Geleneksel Türk Kahvesi',
        grind: 'Toz ince',
        ratio: '1 fincan: 1 tatlı kaşığı',
      },
    ],
  },
  {
    category: 'Yardımcı Ekipmanlar',
    items: [
      {
        name: 'Kahve Öğütücü',
        description:
          'İyi bir öğütücü, kahve makinesinden önce gelir. Burr (konik) öğütücü alın; tutarlı öğütme boyutu aromaya doğrudan etki eder. Taze öğütme = taze aroma.',
        bestFor: 'Tüm demleme yöntemleri',
        grind: '—',
        ratio: '—',
      },
      {
        name: 'Hassas Terazi',
        description:
          '0.1g hassasiyetinde dijital terazi. Su ve kahve oranını doğru tutmak için şart. İyi kahve = tutarlı ölçü.',
        bestFor: 'Tutarlılık',
        grind: '—',
        ratio: '—',
      },
      {
        name: 'Kuğu Boyunlu Su Isıtıcı',
        description:
          'Su akışını hassas kontrol eder. Pour-over yöntemlerinde olmazsa olmaz. Sıcaklık kontrolü olan modeller tercih edilmeli (92-96°C).',
        bestFor: 'V60, Chemex, Kalita',
        grind: '—',
        ratio: '—',
      },
    ],
  },
]

function StaticEkipmanlarFallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      {/* Hero */}
      <div className="mx-auto my-16 max-w-3xl text-center lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">Ekipman Rehberi</span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Kahve Ekipmanları
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Her demleme yönteminin kendine özgü bir dili vardır. Doğru ekipmanla kahvenizin karakterini ortaya
          çıkarabilirsiniz. Pure Olentia olarak size en uygun ekipmanı seçmeniz için rehberlik ediyoruz.
        </p>
      </div>

      {/* Equipment groups */}
      <div className="mx-auto max-w-5xl space-y-16">
        {equipmentGroups.map((group) => (
          <section key={group.category}>
            <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-white">{group.category}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{item.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </p>
                  <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4 text-xs dark:border-neutral-800">
                    <div>
                      <dt className="text-neutral-400">Uygun</dt>
                      <dd className="mt-1 font-medium text-neutral-800 dark:text-neutral-200">{item.bestFor}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-400">Öğütme</dt>
                      <dd className="mt-1 font-medium text-neutral-800 dark:text-neutral-200">{item.grind}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-400">Oran</dt>
                      <dd className="mt-1 font-medium text-neutral-800 dark:text-neutral-200">{item.ratio}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mx-auto mt-20 max-w-3xl rounded-3xl bg-primary-50 p-10 text-center dark:bg-primary-900/20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Hangi ekipmana ihtiyacınız olduğundan emin değil misiniz?
        </h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Bize yazın, damak tadınıza ve bütçenize göre öneride bulunalım.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonPrimary href="/contact">Bize Ulaşın</ButtonPrimary>
        </div>
      </div>
    </div>
  )
}

export default function EkipmanlarPage() {
  return <CmsPage slug="ekipmanlar" kicker="Ekipman Rehberi" fallback={<StaticEkipmanlarFallback />} />
}

