import { Metadata } from 'next'
import CmsPage from '@/components/CmsPage'

export const metadata: Metadata = {
  title: 'Cerez Politikasi',
  description: 'Pure Olentia cerez (cookie) kullanim politikasi.',
}

function Fallback() {
  return (
    <div className="container pb-24 lg:pb-32">
      <div className="mx-auto my-16 max-w-3xl lg:my-24">
        <span className="text-sm font-medium tracking-wider text-primary-700 uppercase">
          Yasal Bilgiler
        </span>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
          Cerez Politikasi
        </h1>
        <p className="mt-4 text-sm text-neutral-500">Son guncellenme: 10 Nisan 2026</p>
      </div>
      <article className="prose prose-sm mx-auto max-w-3xl sm:prose dark:prose-invert">
        <h2>1. Cerez Nedir?</h2>
        <p>
          Cerezler (cookies), web sitemizi ziyaret ettiginizde tarayiciniza veya cihaziniza yerlestirilen
          kucuk metin dosyalaridir. Cerezler, web sitesinin duzgun calismasi, kullanici deneyiminin
          iyilestirilmesi, tercihlerin hatirlanmasi ve site kullaniminin analiz edilmesi amaciyla
          kullanilmaktadir.
        </p>
        <p>
          <strong>Pure Olentia Kahve</strong> olarak, 6698 sayili KVKK ve 5809 sayili Elektronik Haberlesme
          Kanunu uyarinca cerez kullanimina iliskin sizi bilgilendirmekteyiz. Web sitemizi kullanarak cerez
          politikamizi kabul etmis sayilirsiniz.
        </p>

        <h2>2. Kullanilan Cerez Turleri</h2>
        <p>Web sitemizde asagidaki cerez turleri kullanilmaktadir:</p>
        <table>
          <thead>
            <tr>
              <th>Cerez Turu</th>
              <th>Amac</th>
              <th>Sure</th>
              <th>Zorunlu mu?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Zorunlu Cerezler</strong></td>
              <td>
                Sitenin temel islevlerinin calismasi icin gereklidir. Oturum yonetimi, sepet bilgileri ve
                guvenlik kontrolleri bu cerezler araciligiyla saglanir.
              </td>
              <td>Oturum suresi</td>
              <td>Evet</td>
            </tr>
            <tr>
              <td><strong>Performans Cerezleri</strong></td>
              <td>
                Sayfa yukleme hizi, hata kayitlari ve sunucu yanit surelerini olcmek icin kullanilir.
                Kullanici kimligini belirlemez.
              </td>
              <td>En fazla 1 yil</td>
              <td>Hayir</td>
            </tr>
            <tr>
              <td><strong>Analitik Cerezler</strong></td>
              <td>
                Ziyaretci sayisi, sayfa goruntulenme oranlari, trafik kaynaklari ve kullanici
                davranislarini anlamak icin anonim istatistik verileri toplar (ornegin Google Analytics).
              </td>
              <td>En fazla 2 yil</td>
              <td>Hayir</td>
            </tr>
            <tr>
              <td><strong>Islevsellik Cerezleri</strong></td>
              <td>
                Dil tercihi, bolge secimi ve goruntulenme ayarlari gibi kullanici tercihlerini hatirlar.
              </td>
              <td>En fazla 1 yil</td>
              <td>Hayir</td>
            </tr>
            <tr>
              <td><strong>Pazarlama / Hedefleme Cerezleri</strong></td>
              <td>
                Kullaniciya ilgi alanina uygun reklamlar gostermek, reklam kampanyalarinin etkinligini
                olcmek ve yeniden pazarlama (remarketing) faaliyetleri icin kullanilir.
              </td>
              <td>En fazla 2 yil</td>
              <td>Hayir</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Ucuncu Taraf Cerezleri</h2>
        <p>
          Web sitemizde asagidaki ucuncu taraf hizmet saglayicilarinin cerezleri de bulunabilir:
        </p>
        <table>
          <thead>
            <tr>
              <th>Hizmet Saglayici</th>
              <th>Amac</th>
              <th>Tur</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Google Analytics</td>
              <td>Web sitesi trafik analizi ve kullanici davranisi raporlamasi</td>
              <td>Analitik</td>
            </tr>
            <tr>
              <td>Google Ads</td>
              <td>Reklam kampanyalari ve donusum takibi</td>
              <td>Pazarlama</td>
            </tr>
            <tr>
              <td>Meta (Facebook) Pixel</td>
              <td>Sosyal medya reklam optimizasyonu ve yeniden pazarlama</td>
              <td>Pazarlama</td>
            </tr>
            <tr>
              <td>Odeme Kuruluslari</td>
              <td>Guvenli odeme islemi ve dolandiricilik onleme</td>
              <td>Zorunlu</td>
            </tr>
          </tbody>
        </table>
        <p>
          Ucuncu taraf hizmet saglayicilarinin kendi gizlilik politikalari bulunmaktadir. Bu cerezler
          uzerinde Pure Olentia Kahve&apos;nin dogrudan kontrolu sinirlidir.
        </p>

        <h2>4. Cerezlerin Yonetimi</h2>
        <p>
          Sitemize ilk ziyaretinizde gosterilen cerez bildirim bannerini kullanarak cerez tercihlerinizi
          belirleyebilirsiniz. Zorunlu cerezler disindaki tum cerez kategorileri icin rizaniz alinir.
          Tercihlerinizi dilediginiz zaman cerez ayarlari panelimiz uzerinden degistirebilirsiniz.
        </p>

        <h2>5. Tarayici Uzerinden Cerez Ayarlari</h2>
        <p>
          Cerezleri tarayici ayarlariniz uzerinden de kontrol edebilirsiniz. Asagida yaygin kullanilan
          tarayicilarin cerez ayarlari icin yonlendirmeler yer almaktadir:
        </p>
        <ul>
          <li>
            <strong>Google Chrome:</strong> Ayarlar &rarr; Gizlilik ve Guvenlik &rarr; Cerezler ve site
            verileri
          </li>
          <li>
            <strong>Mozilla Firefox:</strong> Ayarlar &rarr; Gizlilik ve Guvenlik &rarr; Cerezler ve Site
            Verileri
          </li>
          <li>
            <strong>Safari:</strong> Tercihler &rarr; Gizlilik &rarr; Cerezleri ve web sitesi verilerini
            yonet
          </li>
          <li>
            <strong>Microsoft Edge:</strong> Ayarlar &rarr; Cerezler ve site izinleri &rarr; Cerezleri ve
            site verilerini yonet
          </li>
        </ul>
        <p>
          Cerezleri tamamen devre disi birakmak, web sitemizin bazi ozelliklerinin duzgun calismamasi ile
          sonuclanabilir. Ornegin sepetinize eklediginiz urunler kaydedilemeyebilir veya oturum bilgileriniz
          hatirlanamayabilir.
        </p>

        <h2>6. Veri Guvenligi</h2>
        <p>
          Cerezler araciligiyla toplanan veriler, sifrelenmis baglanti (SSL/TLS) uzerinden aktarilir ve
          guvenli sunucularda saklanir. Verilere yalnizca yetkili personel ve teknik altyapi erisimine sahip
          hizmet saglayicilari erisebilir. Cerez verileri, KVKK kapsamindaki kisisel veri isleme
          ilkelerine uygun olarak islenir.
        </p>

        <h2>7. Politika Degisiklikleri</h2>
        <p>
          Pure Olentia Kahve, isbu cerez politikasini mevzuat degisiklikleri veya teknik gereksinimler
          dogrultusunda guncelleme hakkini sakli tutar. Degisiklikler bu sayfada yayimlanir ve yayim tarihi
          itibariyla yururluge girer. Onemli degisikliklerde kullanicilara e-posta veya site uzerinden
          bildirim gonderilir.
        </p>

        <h2>8. Iletisim</h2>
        <p>
          Cerez politikamiz veya kisisel verilerinizin islenmesi hakkinda sorulariniz icin bizimle
          iletisime gecebilirsiniz:
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
  return <CmsPage slug="cerez-politikasi" kicker="Yasal Bilgiler" fallback={<Fallback />} />
}
