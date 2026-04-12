import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mesafeli Satis Sozlesmesi',
  description: 'Pure Olentia mesafeli satis sozlesmesi ve tuketici haklari.',
}

export default function MesafeliSatisPage() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">
          Yasal Bilgiler
        </span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Mesafeli Satis Sozlesmesi
        </h1>
        <p className="mt-4 text-sm text-neutral-500">Son guncellenme: 10 Nisan 2026</p>
      </div>
      <article className="prose prose-sm mx-auto max-w-3xl sm:prose dark:prose-invert">
        <h2>Madde 1 - Taraflar</h2>
        <h3>1.1 Satici</h3>
        <table>
          <tbody>
            <tr>
              <td><strong>Unvan</strong></td>
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
        <h3>1.2 Alici</h3>
        <p>
          Alici, web sitesi uzerinden siparis veren ve isbu sozlesmeyi onaylayan gercek veya tuzel kisidir. Alicinin
          kimlik, iletisim ve teslimat bilgileri siparis asamasinda beyan edildigi sekliyledir.
        </p>

        <h2>Madde 2 - Sozlesmenin Konusu</h2>
        <p>
          Isbu sozlesmenin konusu, Alicinin Saticiya ait <strong>pureolentia.com</strong> internet sitesinden
          elektronik ortamda siparisini verdigi asagida nitelikleri ve satis fiyati belirtilen urunlerin satisi ve
          teslimi ile taraflarin hak ve yukumluluklerinin belirlenmesidir. Sozlesme, 6502 sayili Tuketicinin
          Korunmasi Hakkinda Kanun ve Mesafeli Sozlesmeler Yonetmeligi hukumlerine uygun olarak duzenlenmistir.
        </p>

        <h2>Madde 3 - Sozlesme Konusu Urun Bilgileri</h2>
        <p>
          Urunlerin cinsi, miktari, marka/modeli, rengi, satis fiyati (KDV dahil) ve odeme sekli siparis
          ozetinde belirtildigi gibidir. Urun fiyatlari Turk Lirasi (TL) cinsinden gosterilmekte olup tum
          vergiler dahildir.
        </p>
        <p>
          Urunlerin temel ozellikleri, urun detay sayfasinda yer almaktadir. Kampanya suresi boyunca veya stok
          tukenmeden once gecerli olan indirimli fiyatlar ayrica belirtilir.
        </p>

        <h2>Madde 4 - Odeme ve Odeme Sekli</h2>
        <p>Alici, siparis tutarini asagidaki odeme yontemlerinden birini kullanarak odeyebilir:</p>
        <ul>
          <li>Kredi karti veya banka karti ile tek cekim veya taksitli odeme</li>
          <li>Havale/EFT ile banka transferi</li>
          <li>Kapida odeme (nakit veya kredi karti, ek ucret uygulanabilir)</li>
        </ul>
        <p>
          Kredi karti bilgileri, 256-bit SSL sifreleme ile korunmakta olup Satici tarafindan
          saklanmamaktadir. Odeme islemleri, lisansli odeme kuruluslari araciligiyla gerceklestirilir.
        </p>

        <h2>Madde 5 - Teslimat</h2>
        <p>
          Siparis edilen urunler, Alicinin siparis formunda belirttigi teslimat adresine, siparisin
          onaylanmasindan itibaren en gec <strong>30 (otuz) is gunu</strong> icinde teslim edilir. Tahmini
          teslimat suresi urun sayfasinda ve siparis ozetinde ayrica belirtilir. Genel teslimat suresi Istanbul
          ici 1-3, yurt ici diger iller icin 3-5 is gunudur.
        </p>
        <p>
          Teslimat ucreti siparis toplami ve teslimat bolgelerine gore degisiklik gosterebilir. Belirli bir
          siparis tutarinin uzerindeki siparislerde ucretsiz kargo kampanyalari uygulanabilir.
        </p>
        <p>
          Alici, teslimat sirasinda urunu kontrol etmekle yukumludur. Hasarli veya eksik urun teslimi halinde
          tutanak tutulmali ve durum derhal Saticiya bildirilmelidir.
        </p>

        <h2>Madde 6 - Cayma Hakki</h2>
        <p>
          Alici, 6502 sayili Kanun&apos;un 48. maddesi ve Mesafeli Sozlesmeler Yonetmeligi uyarinca, herhangi
          bir gerekce gostermeksizin ve cezai sart odememek kaydiyla, urunu teslim aldigi tarihten itibaren
          <strong> 14 (on dort) gun</strong> icinde cayma hakkini kullanabilir.
        </p>
        <p>Cayma hakkinin kullanilmasi icin:</p>
        <ol>
          <li>
            info@pureolentia.com adresine veya 0552 462 29 54 numarasina cayma bildiriminin yapilmasi
            gerekmektedir.
          </li>
          <li>Urunun, kullanilmamis, ambalaji acilmamis ve orijinal durumunda iade edilmesi sarttir.</li>
          <li>Iade kargo ucreti Aliciya aittir (urun kusurlu ise Satici karsilar).</li>
          <li>
            Cayma bildiriminin Saticiya ulasmasi ve urunun iade edilmesinin ardindan urun bedeli en gec
            <strong> 14 gun</strong> icinde Alicinin odeme yontemine uygun sekilde iade edilir.
          </li>
        </ol>

        <h2>Madde 7 - Cayma Hakkinin Kullanilamayacagi Durumlar</h2>
        <p>
          Mesafeli Sozlesmeler Yonetmeligi&apos;nin 15. maddesi uyarinca asagidaki durumlarda cayma hakki
          kullanilamaz:
        </p>
        <ul>
          <li>
            Fiyati finansal piyasalardaki dalgalanmalara bagli olarak degisen ve Saticinin kontrolunde olmayan
            urunler.
          </li>
          <li>Tuketicinin ozel istekleri veya acikca onun kisisel ihtiyaclari dogrultusunda hazirlanan urunler.</li>
          <li>
            Cabuk bozulabilen veya son kullanma tarihi gecebilecek urunler (ornegin taze cekilmis kahve
            paketlerinin acilmis olmasi halinde).
          </li>
          <li>
            Tesliminden sonra ambalaj, bant, muhur, paket gibi koruyucu unsurlari acilmis olan urunlerden; iadesi
            saglik ve hijyen acisindan uygun olmayanlar.
          </li>
          <li>Tesliminden sonra baska urunlerle karistirilmis ve dogasi geregi ayrilmasi mumkun olmayanlar.</li>
        </ul>

        <h2>Madde 8 - Temerrut Hali ve Hukuki Sonuclari</h2>
        <p>
          Alicinin kredi kartina veya banka hesabina tanimlanan odeme isleminin gerceklesmemesi halinde Alici,
          urun bedelini Saticinin belirledigi vade icinde odemekle yukumludur. Odeme yapilmayana kadar urun
          sevkiyati gerceklestirilmez.
        </p>

        <h2>Madde 9 - Yetkili Mahkeme</h2>
        <p>
          Isbu sozlesmeden dogan uyusmazliklarda, Tuketici Hakem Heyetleri ve Tuketici Mahkemeleri yetkilidir.
          Basvuru sinirlari her yil Ticaret Bakanligi tarafindan belirlenen tutarlara tabidir. Siniri asan
          uyusmazliklarda Alicinin veya Saticinin yerlesim yerindeki Tuketici Mahkemeleri yetkilidir.
        </p>

        <h2>Madde 10 - Yururluk</h2>
        <p>
          Isbu sozlesme, Alici tarafindan elektronik ortamda onaylanmasi ile yururluge girer. Sozlesme,
          taraflar arasinda akdedilmis sayilir ve her iki taraf icin baglayicidir. Alici, siparis surecinde
          sozlesme kosullarini okudugunu ve kabul ettigini beyan eder.
        </p>
        <p>
          Sozlesmenin bir nushasi Alicinin kayitli e-posta adresine gonderilir. Alici, sozlesmenin tamamini
          siparis sonrasi ekraninda goruntuleyebilir ve ciktisini alabilir.
        </p>
      </article>
    </div>
  )
}
