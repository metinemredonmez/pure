import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'Pure Olentia kişisel verilerin korunması ve gizlilik politikası (KVKK).',
}

function Fallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">Yasal Bilgiler</span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Gizlilik Politikası
        </h1>
        <p className="mt-4 text-sm text-neutral-500">Son güncellenme: 10 Nisan 2026</p>
      </div>

      <article className="prose prose-sm mx-auto max-w-3xl sm:prose dark:prose-invert">
        <h2>1. Veri Sorumlusu</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz veri
          sorumlusu sıfatıyla <strong>Pure Olentia Kahve</strong> tarafından aşağıda açıklanan kapsamda işlenmektedir.
        </p>
        <table>
          <tbody>
            <tr><td><strong>Unvan</strong></td><td>Pure Olentia Kahve</td></tr>
            <tr><td><strong>Adres</strong></td><td>Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/İstanbul</td></tr>
            <tr><td><strong>E-posta</strong></td><td>info@pureolentia.com</td></tr>
            <tr><td><strong>Telefon</strong></td><td>0552 462 29 54</td></tr>
          </tbody>
        </table>

        <h2>2. İşlenen Kişisel Veriler</h2>
        <p>Pure Olentia olarak aşağıdaki kişisel verilerinizi işlemekteyiz:</p>
        <table>
          <thead>
            <tr><th>Veri Kategorisi</th><th>İşlenen Veriler</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Kimlik Bilgileri</strong></td><td>Ad, soyad</td></tr>
            <tr><td><strong>İletişim Bilgileri</strong></td><td>E-posta adresi, telefon numarası, teslimat adresi, fatura adresi</td></tr>
            <tr><td><strong>Müşteri İşlem Bilgileri</strong></td><td>Sipariş geçmişi, fatura bilgileri, ödeme referansı (kart numarası saklanmaz)</td></tr>
            <tr><td><strong>Pazarlama Bilgileri</strong></td><td>E-posta bülten aboneliği, çerez tercihleri</td></tr>
            <tr><td><strong>İşlem Güvenliği</strong></td><td>IP adresi, tarayıcı bilgisi, oturum kayıtları</td></tr>
          </tbody>
        </table>

        <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
        <ul>
          <li>Sipariş oluşturma, teslimat ve satış sonrası destek süreçlerinin yürütülmesi</li>
          <li>Sözleşmeden doğan yükümlülüklerin yerine getirilmesi</li>
          <li>Fatura düzenleme ve yasal raporlama yükümlülüklerinin yerine getirilmesi</li>
          <li>Müşteri memnuniyetinin ölçülmesi ve geliştirilmesi</li>
          <li>Onay vermeniz halinde pazarlama ve kampanya iletişimlerinin gönderilmesi</li>
          <li>Web sitemizin güvenliğinin sağlanması ve dolandırıcılığın önlenmesi</li>
          <li>Yasal düzenleme ve denetim yükümlülüklerinin yerine getirilmesi</li>
        </ul>

        <h2>4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
        <p>Kişisel verileriniz aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
        <ul>
          <li><strong>Sözleşmenin kurulması veya ifası:</strong> Sipariş, teslimat ve iade süreçleri</li>
          <li><strong>Kanuni yükümlülük:</strong> Vergi, fatura ve yasal raporlama</li>
          <li><strong>Meşru menfaat:</strong> Hizmet kalitesinin artırılması, güvenlik</li>
          <li><strong>Açık rıza:</strong> Pazarlama iletişimleri ve çerez tercihleri</li>
        </ul>

        <h2>5. Kişisel Verilerin Aktarılması</h2>
        <p>Kişisel verileriniz aşağıdaki hallerde üçüncü kişilerle paylaşılabilir:</p>
        <table>
          <thead>
            <tr><th>Aktarılan Taraf</th><th>Aktarım Amacı</th><th>Aktarılan Veriler</th></tr>
          </thead>
          <tbody>
            <tr><td>Kargo firmaları</td><td>Teslimatın gerçekleştirilmesi</td><td>Ad, adres, telefon</td></tr>
            <tr><td>Ödeme altyapısı (PayTR/Iyzico)</td><td>Güvenli ödeme işlemi</td><td>Ödeme referansı</td></tr>
            <tr><td>E-fatura entegratörü</td><td>Yasal fatura yükümlülüğü</td><td>Fatura bilgileri</td></tr>
            <tr><td>Yasal merciler</td><td>Yasal talep halinde</td><td>İlgili veriler</td></tr>
          </tbody>
        </table>
        <p>Kişisel verileriniz yurtdışına aktarılmamaktadır.</p>

        <h2>6. Kişisel Verilerin Saklanma Süresi</h2>
        <ul>
          <li><strong>Müşteri hesap bilgileri:</strong> Hesap aktif olduğu sürece + hesap silindikten sonra 1 yıl</li>
          <li><strong>Sipariş ve fatura bilgileri:</strong> 10 yıl (Vergi Usul Kanunu)</li>
          <li><strong>Pazarlama onayları:</strong> Onay geri çekilene kadar</li>
          <li><strong>Log kayıtları:</strong> 2 yıl (5651 sayılı Kanun)</li>
        </ul>

        <h2>7. Çerezler (Cookies)</h2>
        <p>
          Sitemizde deneyiminizi iyileştirmek için çerezler kullanılmaktadır. Zorunlu çerezler site işleyişi için
          gereklidir. İsteğe bağlı (analitik/pazarlama) çerezleri dilediğiniz zaman reddedebilirsiniz. Detaylı bilgi
          için <a href="/cerez-politikasi">Çerez Politikası</a> sayfamıza bakınız.
        </p>

        <h2>8. Kişisel Veri Sahibinin Hakları (KVKK Madde 11)</h2>
        <p>KVKK Madde 11 uyarınca sahip olduğunuz haklar:</p>
        <ol>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>KVKK Madde 7 kapsamında silinmesini veya yok edilmesini isteme</li>
          <li>Düzeltme/silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme</li>
          <li>Otomatik sistemlerle yapılan analiz sonucu aleyhinize bir sonuç çıkmasına itiraz etme</li>
          <li>Kanuna aykırı işleme sebebiyle zarara uğramanız halinde tazminat talep etme</li>
        </ol>

        <h2>9. Başvuru Yöntemi</h2>
        <p>
          Yukarıdaki haklarınızı kullanmak için <a href="mailto:info@pureolentia.com">info@pureolentia.com</a> adresine
          kimliğinizi tespit edecek bilgilerle birlikte e-posta gönderebilirsiniz. Başvurularınız en geç 30 gün içinde
          yanıtlanacaktır. İşlemin ayrıca bir maliyet gerektirmesi halinde, Kişisel Verileri Koruma Kurulu tarafından
          belirlenen tarifedeki ücret alınacaktır.
        </p>

        <h2>10. Politika Güncellemeleri</h2>
        <p>
          Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler e-posta ile kayıtlı kullanıcılara
          bildirilecektir. Güncel politikayı her zaman bu sayfadan görüntüleyebilirsiniz.
        </p>
      </article>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="gizlilik-politikasi" kicker="Yasal Bilgiler" fallback={<Fallback />} />
}
