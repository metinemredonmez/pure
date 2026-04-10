import CmsPage from '@/components/CmsPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'Pure Olentia kişisel verilerin korunması ve gizlilik politikası (KVKK).',
}

const fallback = (
  <div className="container pb-24 lg:pb-32">
    <div className="mx-auto my-16 max-w-3xl lg:my-24">
      <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">Yasal Bilgiler</span>
      <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
        Gizlilik Politikası
      </h1>
      <p className="mt-6 text-neutral-600 dark:text-neutral-400">Son güncellenme: 10 Nisan 2026</p>
    </div>

    <article className="prose prose-sm mx-auto max-w-3xl sm:prose dark:prose-invert">
      <h2>1. Veri Sorumlusu</h2>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz veri
        sorumlusu sıfatıyla <strong>Pure Olentia Kahve</strong> tarafından işlenmektedir.
      </p>
      <p>
        Adres: Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul
        <br />
        E-posta: info@pureolentia.com
        <br />
        Telefon: 0552 462 29 54
      </p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <ul>
        <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
        <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon, teslimat ve fatura adresi</li>
        <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, fatura bilgileri, ödeme referansı</li>
        <li><strong>Pazarlama Bilgileri:</strong> Bülten aboneliği, çerez tercihleri</li>
        <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, tarayıcı, oturum kayıtları</li>
      </ul>

      <h2>3. İşlenme Amaçları</h2>
      <ul>
        <li>Sipariş oluşturma, teslimat ve satış sonrası destek süreçleri</li>
        <li>Sözleşmeden doğan yükümlülüklerin yerine getirilmesi</li>
        <li>Fatura düzenleme ve yasal raporlama</li>
        <li>Onay vermeniz halinde pazarlama iletişimi</li>
        <li>Web sitesi güvenliği</li>
      </ul>

      <h2>4. Aktarım</h2>
      <ul>
        <li><strong>Kargo firmaları:</strong> Teslimat için ad, adres, telefon</li>
        <li><strong>Ödeme altyapısı:</strong> PayTR / Iyzico</li>
        <li><strong>E-fatura entegratörü:</strong> Yasal fatura yükümlülüğü</li>
        <li><strong>Yasal merciler:</strong> Yasal talep halinde</li>
      </ul>
      <p>Kişisel verileriniz yurtdışına aktarılmamaktadır.</p>

      <h2>5. Çerezler</h2>
      <p>
        Sitemizde deneyiminizi iyileştirmek için çerezler kullanılmaktadır. Zorunlu çerezler site işleyişi için
        gereklidir. İsteğe bağlı çerezleri dilediğiniz zaman reddedebilirsiniz.
      </p>

      <h2>6. Haklarınız (KVKK Madde 11)</h2>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse bilgi talep etme, amacını öğrenme</li>
        <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
        <li>Silinmesini veya yok edilmesini isteme</li>
        <li>Aleyhinize otomatik bir sonuç çıkmasına itiraz etme</li>
        <li>Zarara uğramanız halinde tazminat talep etme</li>
      </ul>

      <h2>7. Başvuru</h2>
      <p>
        Haklarınızı kullanmak için <a href="mailto:info@pureolentia.com">info@pureolentia.com</a> adresine
        ulaşabilirsiniz. Başvurularınız 30 gün içinde yanıtlanacaktır.
      </p>
    </article>
  </div>
)

export default function GizlilikPolitikasiPage() {
  return <CmsPage slug="gizlilik-politikasi" kicker="Yasal Bilgiler" fallback={fallback} />
}
