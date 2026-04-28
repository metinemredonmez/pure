import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'Kullanim Kosullari',
  description: 'Pure Olentia web sitesi kullanim kosullari ve uyelik sartlari.',
}

function Fallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">
          Yasal Bilgiler
        </span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Kullanim Kosullari
        </h1>
        <p className="mt-4 text-sm text-neutral-500">Son guncellenme: 10 Nisan 2026</p>
      </div>
      <article className="prose prose-sm mx-auto max-w-3xl sm:prose dark:prose-invert">
        <h2>1. Genel Hukumler</h2>
        <p>
          Isbu kullanim kosullari, <strong>Pure Olentia Kahve</strong> tarafindan isletilen
          pureolentia.com web sitesinin (&quot;Site&quot;) kullanimina iliskin sart ve kosullari duzenler. Siteyi
          ziyaret eden, uye olan veya siparis veren her kullanici isbu kosullari kabul etmis sayilir.
        </p>
        <p>
          Pure Olentia Kahve, isbu kullanim kosullarini onceden bildirimde bulunmaksizin degistirme hakkini sakli
          tutar. Guncel kosullar her zaman bu sayfada yayimlanir ve yayimlandigi tarihte yururluge girer.
        </p>
        <table>
          <tbody>
            <tr>
              <td><strong>Site Sahibi</strong></td>
              <td>Pure Olentia Kahve</td>
            </tr>
            <tr>
              <td><strong>Adres</strong></td>
              <td>Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/Istanbul</td>
            </tr>
            <tr>
              <td><strong>E-posta</strong></td>
              <td>info@pureolentia.com</td>
            </tr>
            <tr>
              <td><strong>Telefon</strong></td>
              <td>0552 462 29 54</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Uyelik Kosullari</h2>
        <p>
          Siteye uye olmak icin 18 yasini doldurmus olmak gerekmektedir. Uyelik sirasinda beyan edilen
          bilgilerin dogrulugu kullanicinin sorumlulugundadir. Yanlis veya eksik bilgi nedeniyle ortaya cikan
          sorunlardan Pure Olentia Kahve sorumlu tutulamaz.
        </p>
        <p>
          Kullanici, hesap bilgilerini (e-posta ve sifre) gizli tutmakla yukumludur. Hesabin ucuncu kisiler
          tarafindan yetkisiz kullaniminda sorumluluk kullaniciya aittir. Supheli bir erisim fark edildiginde
          derhal info@pureolentia.com adresine bildirimde bulunulmalidir.
        </p>
        <p>
          Pure Olentia Kahve, isbu kosullari ihlal eden, sahte hesap olusturan veya dolandiricilik
          faaliyetlerinde bulunan kullanicilarin uyeliklerini onceden bildirimde bulunmaksizin askiya alma
          veya sonlandirma hakkini sakli tutar.
        </p>

        <h2>3. Fikri Mulkiyet Haklari</h2>
        <p>
          Site uzerinde yer alan tum icerikler — metin, gorsel, grafik, logo, ikon, ses, video, yazilim,
          tasarim ve diger materyaller — Pure Olentia Kahve&apos;nin mulkiyetindedir veya lisans altinda
          kullanilmaktadir. Bu icerikler, 5846 sayili Fikir ve Sanat Eserleri Kanunu ve ilgili mevzuat
          kapsaminda korunmaktadir.
        </p>
        <p>
          Kullanicilar, Site icerigini Pure Olentia Kahve&apos;nin yazili izni olmaksizin kopyalayamaz,
          cogaltamaz, dagitamaz, yeniden yayimlayamaz veya ticari amacla kullanamazlar. &quot;Pure
          Olentia&quot; markasi ve logosu tescilli marka olup izinsiz kullaniminda hukuki islem baslatilir.
        </p>

        <h2>4. Siparis ve Odeme</h2>
        <p>
          Kullanici, Site uzerinden urun siparis verebilir. Siparisin tamamlanmasi icin teslimat bilgileri,
          fatura bilgileri ve odeme yontemi secimi gereklidir. Siparis, odemenin basarili sekilde
          gerceklesmesinin ardindan onaylanir.
        </p>
        <p>
          Urun fiyatlari Turk Lirasi (TL) cinsinden belirtilir ve tum vergiler (KDV) dahildir. Pure Olentia
          Kahve, urun fiyatlarini ve kampanya kosullarini onceden bildirimde bulunmaksizin degistirme hakkini
          sakli tutar; ancak siparis onaylanmis urunlerin fiyatinda degisiklik yapilmaz.
        </p>
        <p>
          Odeme islemleri, guvenli odeme altyapisi saglayan lisansli odeme kuruluslari araciligiyla
          gerceklestirilir. Kredi karti bilgileri Pure Olentia Kahve sunucularinda saklanmaz.
        </p>

        <h2>5. Iade ve Degisim</h2>
        <p>
          Iade ve degisim islemleri, 6502 sayili Tuketicinin Korunmasi Hakkinda Kanun ve Mesafeli Sozlesmeler
          Yonetmeligi hukumleri cercevesinde gerceklestirilir. Detayli bilgi icin &quot;Mesafeli Satis
          Sozlesmesi&quot; ve &quot;Iade ve Degisim&quot; sayfalarimizi inceleyebilirsiniz.
        </p>
        <ul>
          <li>Cayma hakki suresi: Teslimat tarihinden itibaren 14 gun.</li>
          <li>Urun kullanilmamis ve orijinal ambalajinda olmalidir.</li>
          <li>Acilmis gida urunlerinde hijyen gerekceleriyle iade kabul edilmeyebilir.</li>
          <li>Kusurlu urunlerde kargo ucreti Pure Olentia Kahve tarafindan karsilanir.</li>
        </ul>

        <h2>6. Sorumluluk Sinirlamasi</h2>
        <p>
          Pure Olentia Kahve, Site&apos;nin kesintisiz, hatasz veya guvenli bir sekilde calisacagini garanti
          etmez. Teknik arizalar, bakim calismalari veya mucbir sebepler nedeniyle olusan erisim kesintilerinden
          dolayi sorumluluk kabul edilmez.
        </p>
        <p>
          Site uzerinden ucuncu taraf web sitelerine verilen linklerden Pure Olentia Kahve sorumlu degildir.
          Kullanici, bu sitelere erisimde kendi sorumlulugundadir.
        </p>
        <p>
          Pure Olentia Kahve&apos;nin toplam sorumlulugu, her durumda kullanicinin son 12 ay icinde
          gerceklestirdigi alisverisl toplam tutari ile sinirlidir.
        </p>

        <h2>7. Gizlilik</h2>
        <p>
          Kullanicilarin kisisel verileri, 6698 sayili KVKK ve ilgili mevzuat kapsaminda islenmektedir.
          Kisisel verilerin islenmesine iliskin detayli bilgi icin &quot;KVKK Aydinlatma Metni&quot; ve
          &quot;Gizlilik Politikasi&quot; sayfalarimizi inceleyebilirsiniz. Cerez kullanimina iliskin bilgiler
          &quot;Cerez Politikasi&quot; sayfamizda yer almaktadir.
        </p>

        <h2>8. Mucbir Sebepler</h2>
        <p>
          Dogal afetler, savas, grev, lokavt, salgin hastalik, internet altyapisi sorunlari, enerji kesintisi
          ve benzeri mucbir sebep hallerinde Pure Olentia Kahve yukumluluklerini yerine getiremeyebilir. Bu
          durumda sorumluluk dogmaz ve teslimat surelerine mucbir sebebin devam suresi eklenir.
        </p>

        <h2>9. Uygulanacak Hukuk ve Uyusmazlik Cozumu</h2>
        <p>
          Isbu kullanim kosullari, Turkiye Cumhuriyeti kanunlarina tabidir. Uyusmazliklarda Istanbul
          (Anadolu) Mahkemeleri ve Icra Daireleri yetkilidir. Tuketici islemleri bakimindan Tuketici Hakem
          Heyetleri ve Tuketici Mahkemeleri yetkili olup basvuru sinirlari her yil Ticaret Bakanligi
          tarafindan belirlenir.
        </p>

        <h2>10. Iletisim</h2>
        <p>
          Isbu kullanim kosullarina iliskin sorulariniz icin asagidaki kanallardan bize ulasabilirsiniz:
        </p>
        <ul>
          <li><strong>E-posta:</strong> info@pureolentia.com</li>
          <li><strong>Telefon:</strong> 0552 462 29 54</li>
          <li>
            <strong>Adres:</strong> Abdurrahmangazi, Nane Sk. No:8, 34887 Sancaktepe/Istanbul
          </li>
        </ul>
      </article>
    </div>
  )
}

export default function Page() {
  return <CmsPage slug="kullanim-kosullari" kicker="Yasal Bilgiler" fallback={<Fallback />} />
}
