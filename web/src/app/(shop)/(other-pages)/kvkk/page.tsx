import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: 'Pure Olentia KVKK kapsamında kişisel verilerin korunması aydınlatma metni.',
}

function Fallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">
          Yasal Bilgiler
        </span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          KVKK Aydınlatma Metni
        </h1>
        <p className="mt-4 text-sm text-neutral-500">Son guncellenme: 10 Nisan 2026</p>
      </div>
      <article className="prose prose-sm mx-auto max-w-3xl sm:prose dark:prose-invert">
        <h2>1. Veri Sorumlusu</h2>
        <p>
          6698 sayili Kisisel Verilerin Korunmasi Kanunu (&quot;KVKK&quot;) uyarinca, kisisel verileriniz; veri
          sorumlusu sifatiyla <strong>Pure Olentia Kahve</strong> tarafindan asagida aciklanan amaclarla
          islenebilecektir.
        </p>
        <table>
          <thead>
            <tr>
              <th>Bilgi</th>
              <th>Detay</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Unvan</td>
              <td>Pure Olentia Kahve</td>
            </tr>
            <tr>
              <td>Adres</td>
              <td>Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/Istanbul</td>
            </tr>
            <tr>
              <td>E-posta</td>
              <td>info@pureolentia.com</td>
            </tr>
            <tr>
              <td>Telefon</td>
              <td>0552 462 29 54</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Islenen Kisisel Veriler</h2>
        <p>
          Web sitemiz ve mobil uygulamalarimiz uzerinden asagidaki kisisel veri kategorileri islenebilmektedir:
        </p>
        <table>
          <thead>
            <tr>
              <th>Veri Kategorisi</th>
              <th>Ornekler</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Kimlik Bilgileri</td>
              <td>Ad, soyad, T.C. kimlik numarasi (fatura icin)</td>
            </tr>
            <tr>
              <td>Iletisim Bilgileri</td>
              <td>E-posta adresi, telefon numarasi, teslimat ve fatura adresi</td>
            </tr>
            <tr>
              <td>Musteri Islem Bilgileri</td>
              <td>Siparis gecmisi, odeme kayitlari, iade talepleri</td>
            </tr>
            <tr>
              <td>Finansal Bilgiler</td>
              <td>Banka hesap bilgileri, kredi karti bilgileri (sifrelenmis olarak odeme kurulusu tarafindan islenir)</td>
            </tr>
            <tr>
              <td>Dijital Iz Bilgileri</td>
              <td>IP adresi, cerez verileri, tarayici bilgileri, sayfa goruntulenme verileri</td>
            </tr>
            <tr>
              <td>Pazarlama Bilgileri</td>
              <td>Alisveris tercihleri, kampanya katilim bilgileri, anket verileri</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Kisisel Verilerin Islenme Amaclari</h2>
        <p>Toplanan kisisel verileriniz asagidaki amaclarla islenmektedir:</p>
        <ul>
          <li>Uyelik islemlerinin gerceklestirilmesi ve hesap yonetimi</li>
          <li>Siparis olusturma, odeme islemleri ve kargo/teslimat sureclerinin yurutulmesi</li>
          <li>Fatura duzenlenmesi ve muhasebe yuzumluluklerin yerine getirilmesi</li>
          <li>Musteri hizmetleri sureclerinin yurutulmesi, sikayet ve taleplerin cevaplanmasi</li>
          <li>Iade ve degisim sureclerinin yonetilmesi</li>
          <li>Kisisellestirilmis urun onerileri ve pazarlama faaliyetlerinin yurutulmesi (acik rizaniz dahilinde)</li>
          <li>E-bulten ve kampanya bildirimlerinin gonderilmesi (acik rizaniz dahilinde)</li>
          <li>Web sitesi performansinin analiz edilmesi ve kullanici deneyiminin iyilestirilmesi</li>
          <li>Yasal yukumluluklerin yerine getirilmesi ve yetkili kamu kurumlarina bilgi verilmesi</li>
          <li>Dolandiricilik ve suc onleme amaciyla guvenlik onlemlerinin alinmasi</li>
        </ul>

        <h2>4. Kisisel Verilerin Islenmesinin Hukuki Sebepleri</h2>
        <p>Kisisel verileriniz, KVKK&apos;nin 5. ve 6. maddelerinde belirtilen asagidaki hukuki sebeplere dayanilarak islenmektedir:</p>
        <ul>
          <li>
            <strong>Sozlesmenin kurulmasi veya ifasi:</strong> Siparis, odeme ve teslimat islemlerinin
            gerceklestirilmesi.
          </li>
          <li>
            <strong>Kanuni yukumluluk:</strong> Vergi mevzuati, Ticaret Kanunu ve tuketici mevzuati kapsamindaki
            yukumluluklerin yerine getirilmesi.
          </li>
          <li>
            <strong>Mesru menfaat:</strong> Dolandiricilik onleme, sistem guvenligi ve is surekliligi saglanmasi.
          </li>
          <li>
            <strong>Acik riza:</strong> Pazarlama iletisimleri, kisisellestirilmis reklam ve cerez kullanimi.
          </li>
        </ul>

        <h2>5. Kisisel Verilerin Aktarilmasi</h2>
        <p>
          Kisisel verileriniz, yukarida belirtilen amaclar dogrultusunda ve KVKK&apos;nin 8. ve 9. maddelerine uygun
          olarak asagidaki taraflara aktarilabilir:
        </p>
        <ul>
          <li>Kargo ve lojistik sirketleri (teslimat sureclerinin yurutulmesi icin)</li>
          <li>Odeme kuruluslari ve bankalar (odeme islemlerinin gerceklestirilmesi icin)</li>
          <li>Muhasebe ve mali musavirlik firmalari (yasal yukumlulukler icin)</li>
          <li>Sunucu ve bulut hizmet saglayicilari (veri depolama ve islem icin)</li>
          <li>Yetkili kamu kurum ve kuruluslari (yasal zorunluluk halinde)</li>
          <li>Analiz ve pazarlama hizmet saglayicilari (anonimlestirilmis veriler ile)</li>
        </ul>

        <h2>6. Kisisel Verilerin Saklama Suresi</h2>
        <p>
          Kisisel verileriniz, islendikleri amac icin gerekli olan sure boyunca ve ilgili mevzuatta ongozulen
          zamanasimlari dahilinde saklanmaktadir. Genel saklama sureleri asagidaki gibidir:
        </p>
        <table>
          <thead>
            <tr>
              <th>Veri Turu</th>
              <th>Saklama Suresi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Uyelik bilgileri</td>
              <td>Uyelik suresince ve uyelik sonlandirildiktan sonra 3 yil</td>
            </tr>
            <tr>
              <td>Siparis ve fatura bilgileri</td>
              <td>10 yil (Vergi Usul Kanunu)</td>
            </tr>
            <tr>
              <td>Cerez verileri</td>
              <td>En fazla 2 yil</td>
            </tr>
            <tr>
              <td>Pazarlama iletisim verileri</td>
              <td>Rizanin geri cekilmesine kadar</td>
            </tr>
            <tr>
              <td>Musteri hizmetleri kayitlari</td>
              <td>3 yil</td>
            </tr>
          </tbody>
        </table>

        <h2>7. Veri Sahibi Olarak Haklariniz</h2>
        <p>KVKK&apos;nin 11. maddesi kapsaminda asagidaki haklara sahipsiniz:</p>
        <ol>
          <li>Kisisel verilerinizin islenip islenmedigini ogrenme</li>
          <li>Kisisel verileriniz islenmisse buna iliskin bilgi talep etme</li>
          <li>Kisisel verilerinizin islenme amacini ve bunlarin amacina uygun kullanilip kullanilmadigini ogrenme</li>
          <li>Yurt icinde veya yurt disinda kisisel verilerinizin aktarildigi ucuncu kisileri bilme</li>
          <li>Kisisel verilerinizin eksik veya yanlis islenmis olmasi halinde bunlarin duzeltilmesini isteme</li>
          <li>
            KVKK&apos;nin 7. maddesinde ongozulen sartlar cercevesinde kisisel verilerinizin silinmesini veya yok
            edilmesini isteme
          </li>
          <li>
            Duzeltme ve silme islemlerinin, kisisel verilerin aktarildigi ucuncu kisilere bildirilmesini isteme
          </li>
          <li>
            Islenen verilerin munhasiran otomatik sistemler vasitasiyla analiz edilmesi suretiyle aleyhinize bir
            sonucun ortaya cikmasina itiraz etme
          </li>
          <li>
            Kisisel verilerinizin kanuna aykiri olarak islenmesi sebebiyle zarara ugramaniz halinde zararin
            giderilmesini talep etme
          </li>
        </ol>

        <h2>8. Basvuru Yontemi</h2>
        <p>
          Yukaridaki haklarinizi kullanmak icin asagidaki yontemlerden birini tercih edebilirsiniz:
        </p>
        <ul>
          <li>
            <strong>E-posta:</strong> info@pureolentia.com adresine kimlik teyidinizi iceren bir e-posta
            gonderebilirsiniz.
          </li>
          <li>
            <strong>Yazili basvuru:</strong> Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/Istanbul adresine
            kimliginizi tevsik edici belgelerle birlikte noter kanalıyla veya iadeli taahhutlu posta ile basvurabilirsiniz.
          </li>
        </ul>
        <p>
          Basvurulariniz en gec <strong>30 gun</strong> icinde ucretsiz olarak sonuclandirilacaktir. Ancak islemin
          ayrica bir maliyet gerektirmesi halinde Kisisel Verileri Koruma Kurulu tarafindan belirlenen tarifedeki
          ucret alinabilir.
        </p>
        <p>
          Pure Olentia Kahve, isbu aydinlatma metnini yasal duzenlemelere uyum saglamak amaciyla guncelleyebilir.
          Guncellemeler web sitemiz uzerinden yayimlanacaktir.
        </p>
      </article>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="kvkk" kicker="Yasal Bilgiler" fallback={<Fallback />} />
}
