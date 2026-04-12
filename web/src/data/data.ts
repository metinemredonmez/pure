import collectionImage1 from '@/images/collections/1.png'
import collectionImage2 from '@/images/collections/2.png'
import collectionImage3 from '@/images/collections/3.png'
import collectionImage4 from '@/images/collections/4.png'
import collectionImage5 from '@/images/collections/5.png'
import collectionImage6 from '@/images/collections/6.png'
import collectionImage7 from '@/images/collections/7.png'
import boothImage1 from '@/images/collections/booth1.png'
import boothImage2 from '@/images/collections/booth2.png'
import boothImage3 from '@/images/collections/booth3.png'
import boothImage4 from '@/images/collections/booth4.png'
import productImage1_1 from '@/images/products/p1-1.jpg'
import productImage1_2 from '@/images/products/p1-2.jpg'
import productImage1_3 from '@/images/products/p1-3.jpg'
import productImage1 from '@/images/products/p1.jpg'
import productImage2_1 from '@/images/products/p2-1.jpg'
import productImage2_2 from '@/images/products/p2-2.jpg'
import productImage2_3 from '@/images/products/p2-3.jpg'
import productImage2 from '@/images/products/p2.jpg'
import productImage3_1 from '@/images/products/p3-1.jpg'
import productImage3_2 from '@/images/products/p3-2.jpg'
import productImage3_3 from '@/images/products/p3-3.jpg'
import productImage3 from '@/images/products/p3.jpg'
import productImage4_1 from '@/images/products/p4-1.jpg'
import productImage4_2 from '@/images/products/p4-2.jpg'
import productImage4_3 from '@/images/products/p4-3.jpg'
import productImage4 from '@/images/products/p4.jpg'
import productImage5_1 from '@/images/products/p5-1.jpg'
import productImage5_2 from '@/images/products/p5-2.jpg'
import productImage5_3 from '@/images/products/p5-3.jpg'
import productImage5 from '@/images/products/p5.jpg'
import productImage6_1 from '@/images/products/p6-1.jpg'
import productImage6_2 from '@/images/products/p6-2.jpg'
import productImage6_3 from '@/images/products/p6-3.jpg'
import productImage6 from '@/images/products/p6.jpg'
import productImage7_1 from '@/images/products/p7-1.jpg'
import productImage7_2 from '@/images/products/p7-2.jpg'
import productImage7_3 from '@/images/products/p7-3.jpg'
import productImage7 from '@/images/products/p7.jpg'
import productImage8_1 from '@/images/products/p8-1.jpg'
import productImage8_2 from '@/images/products/p8-2.jpg'
import productImage8_3 from '@/images/products/p8-3.jpg'
import productImage8 from '@/images/products/p8.jpg'
import avatarImage1 from '@/images/users/avatar1.jpg'
import avatarImage2 from '@/images/users/avatar2.jpg'
import avatarImage3 from '@/images/users/avatar3.jpg'
import avatarImage4 from '@/images/users/avatar4.jpg'
import blogImage1 from '@/images/blog/blog1.jpg'
import blogImage2 from '@/images/blog/blog2.jpg'
import blogImage3 from '@/images/blog/blog3.jpg'
import blogImage4 from '@/images/blog/blog4.jpg'
import blogImage5 from '@/images/blog/blog5.jpg'
import blogImage6 from '@/images/blog/blog6.jpg'
import { shuffleArray } from '@/utils/shuffleArray'

export async function getOrder(number: string) {
  const allOrders = await getOrders()
  let order = allOrders.find((order) => order.number.toString() === number)

  if (!order) {
    // throw new Error( `Order with number ${number} not found.` )

    // for demo purposes, we can log a warning and return the first order
    // If no order found, return the first order as a fallback
    console.warn(`Order with number ${number} not found. Returning the first order as a fallback.`)
    order = allOrders[0]
  }

  return order
}
export async function getOrders() {
  return [
    {
      number: '4657',
      date: 'March 22, 2025',
      status: 'Delivered on January 11, 2025',
      invoiceHref: '#',
      totalQuantity: 4,
      cost: {
        subtotal: 199,
        shipping: 0,
        tax: 0,
        total: 199,
        discount: 0,
      },
      products: [
        {
          id: 'gid://2',
          title: 'Nomad Tumbler',
          handle: 'nomad-tumbler',
          description:
            'This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.',
          href: '#',
          price: 35,
          status: 'Preparing to ship',
          step: 1,
          date: 'March 24, 2021',
          datetime: '2021-03-24',
          address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
          email: 'f•••@example.com',
          phone: '1•••••••••40',
          featuredImage: {
            src: productImage2.src,
            width: productImage2.width,
            height: productImage2.height,
            alt: 'Insulated bottle with white base and black snap lid.',
          },
          quantity: 1,
          size: 'XS',
          color: 'Black Brown',
        },
        {
          id: 'gid://3',
          title: 'Minimalist Wristwatch',
          handle: 'minimalist-wristwatch',
          description: 'This contemporary wristwatch has a clean, minimalist look and high quality components.',
          href: '#',
          price: 149,
          status: 'Shipped',
          step: 0,
          date: 'March 23, 2021',
          datetime: '2021-03-23',
          address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
          email: 'f•••@example.com',
          phone: '1•••••••••40',
          featuredImage: {
            src: productImage4.src,
            width: productImage4.width,
            height: productImage4.height,
            alt: 'Insulated bottle with white base and black snap lid.',
          },
          quantity: 1,
          size: 'XL',
          color: 'White',
        },
      ],
    },
    {
      number: '4376',
      status: 'Delivered on January 08, 2028',
      invoiceHref: '#',
      date: 'March 22, 2025',
      totalQuantity: 4,
      cost: {
        subtotal: 199,
        shipping: 0,
        tax: 0,
        total: 199,
        discount: 0,
      },
      products: [
        {
          id: 'gid://1',
          title: 'Nomad Tumbler',
          handle: 'nomad-tumbler',
          description:
            'This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.',
          href: '#',
          price: 99,
          status: 'Preparing to ship',
          step: 1,
          date: 'March 24, 2021',
          datetime: '2021-03-24',
          address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
          email: 'f•••@example.com',
          phone: '1•••••••••40',
          featuredImage: {
            src: productImage1.src,
            width: productImage1.width,
            height: productImage1.height,
            alt: 'Insulated bottle with white base and black snap lid.',
          },
          quantity: 1,
          size: 'M',
          color: 'Black',
        },
      ],
    },
  ]
}

export async function getCountries() {
  return [
    {
      name: 'Canada',
      code: 'CA',
      flagUrl: '/flags/ca.svg',
      regions: [
        'Alberta',
        'British Columbia',
        'Manitoba',
        'New Brunswick',
        'Newfoundland and Labrador',
        'Northwest Territories',
        'Nova Scotia',
        'Nunavut',
        'Ontario',
        'Prince Edward Island',
        'Quebec',
        'Saskatchewan',
        'Yukon',
      ],
    },
    {
      name: 'Mexico',
      code: 'MX',
      flagUrl: '/flags/mx.svg',
      regions: [
        'Aguascalientes',
        'Baja California',
        'Baja California Sur',
        'Campeche',
        'Chiapas',
        'Chihuahua',
        'Ciudad de Mexico',
        'Coahuila',
        'Colima',
        'Durango',
        'Guanajuato',
        'Guerrero',
        'Hidalgo',
        'Jalisco',
        'Mexico State',
        'Michoacán',
        'Morelos',
        'Nayarit',
        'Nuevo León',
        'Oaxaca',
        'Puebla',
        'Querétaro',
        'Quintana Roo',
        'San Luis Potosí',
        'Sinaloa',
        'Sonora',
        'Tabasco',
        'Tamaulipas',
        'Tlaxcala',
        'Veracruz',
        'Yucatán',
        'Zacatecas',
      ],
    },
    {
      name: 'United States',
      code: 'US',
      flagUrl: '/flags/us.svg',
      regions: [
        'Alabama',
        'Alaska',
        'American Samoa',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'Washington DC',
        'Micronesia',
        'Florida',
        'Georgia',
        'Guam',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Marshall Islands',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Northern Mariana Islands',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Palau',
        'Pennsylvania',
        'Puerto Rico',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Vermont',
        'U.S. Virgin Islands',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming',
        'Armed Forces Americas',
        'Armed Forces Europe',
        'Armed Forces Pacific',
      ],
    },
  ]
}

export async function getShopData() {
  return {
    description: 'An example shop with GraphQL.',
    name: 'graphql',
    termsOfService: {
      url: 'https://checkout.shopify.com/13120893/policies/30401347.html?locale=en',
      title: 'Terms of Service',
      id: 'gid://shopify/ShopPolicy/30401347',
      handle: 'terms-of-service',
      body: 'lorem ispsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nisl nunc egestas nunc, vitae facilisis nunc nisi euismod nisi.',
    },
    subscriptionPolicy: {
      body: '<p>Subscription Policy</p>',
      handle: 'refund-policy',
      id: 'gid://shopify/ShopPolicy/30401219',
      title: 'Refund Policy',
      url: 'https://checkout.shopify.com/13120893/policies/30401219.html?locale=en',
    },
    shippingPolicy: {
      body: '<p>Shipping Policy</p>',
      handle: 'shipping-policy',
      id: 'gid://shopify/ShopPolicy/23745298488',
      title: 'Shipping Policy',
      url: 'https://checkout.shopify.com/13120893/policies/23745298488.html?locale=en',
    },
    refundPolicy: {
      body: '<p>refundPolicy</p>',
      handle: 'refund-policy',
      id: 'gid://shopify/ShopPolicy/30401219',
      title: 'Refund Policy',
      url: 'https://checkout.shopify.com/13120893/policies/30401219.html?locale=en',
    },
    privacyPolicy: {
      body: '<p>privacyPolicy</p>',
      handle: 'privacy-policy',
      id: 'gid://shopify/ShopPolicy/30401283',
      title: 'Privacy Policy',
      url: 'https://checkout.shopify.com/13120893/policies/30401283.html?locale=en',
    },
    primaryDomain: {
      url: 'https://graphql.myshopify.com',
    },
  }
}

export async function getProductReviews(handle: string) {
  return [
    {
      id: '1',
      title: 'Muhteşem aroma ve tazelik',
      rating: 5,
      content: `
        <p>Kahvenin tarladan fincana yolculuğunu takip edebilmek inanılmaz. Sipariş ettikten birkaç gün sonra taze kavrulmuş olarak elime ulaştı.</p>
        <p>Ethiopia Yirgacheffe'nin çiçeksi notaları gerçekten etkileyici. Artık başka kahve almıyorum.</p>
      `,
      author: 'Ahmet Y.',
      authorAvatar: avatarImage1,
      date: 'Mart 16, 2025',
      datetime: '2025-03-16',
    },
    {
      id: '2',
      title: 'Her sabahın vazgeçilmezi oldu',
      rating: 4,
      content: `
        <p>Colombia Supremo blend'i denedim ve harika. Çikolata ve fındık notaları tam benim damak tadıma uygun.</p>
        <p>Abonelik sistemi de çok pratik - her ay kapıma taze kahve geliyor, hiç düşünmeme gerek kalmıyor.</p>
      `,
      author: 'Zeynep K.',
      authorAvatar: avatarImage2,
      date: 'Şubat 10, 2025',
      datetime: '2025-02-10',
    },
    {
      id: '3',
      title: 'Specialty kahveye harika bir giriş',
      rating: 4,
      content: `
        <p>Daha önce sadece market kahvesi içiyordum. Pure Olentia ile specialty dünyasını keşfettim.</p>
        <p>Müşteri hizmetleri de çok ilgili - demleme yöntemi konusunda bile tavsiyelerde bulundular.</p>
      `,
      author: 'Mert B.',
      authorAvatar: avatarImage3,
      date: 'Ocak 22, 2025',
      datetime: '2025-01-22',
    },
    {
      id: '4',
      title: 'Kurumsal sipariş için mükemmel',
      rating: 5,
      content: `
        <p>Ofisimiz için toplu sipariş veriyoruz. Kalite her seferinde tutarlı ve teslimat hızlı.</p>
        <p>Çalışanlarımız kahve kalitesindeki farkı hemen fark etti. Teşekkürler Olentia!</p>
      `,
      author: 'Selin D.',
      authorAvatar: avatarImage4,
      date: 'Ocak 05, 2025',
      datetime: '2025-01-05',
    },
  ]
}

export async function getBlogPosts() {
  return [
    {
      id: '1',
      title: 'Specialty Kahve Nedir? Yeni Başlayanlar İçin Rehber',
      handle: 'specialty-kahve-nedir-rehber',
      excerpt:
        'Specialty kahve, 80 puan ve üzeri alan, tarladan fincana kadar her aşaması izlenebilir kahvelere verilen isimdir. Bu rehberde temel kavramları ve demleme yöntemlerini keşfedin.',
      featuredImage: {
        src: blogImage1.src,
        alt: 'Specialty kahve çekirdekleri',
        width: 800,
        height: 533,
      },
      date: 'Oca 15, 2025',
      datetime: '2025-01-15',
      category: { title: 'Kahve Rehberi', href: '#' },
      timeToRead: '5 dk okuma',
      author: {
        name: 'Emre Dönmez',
        avatar: {
          src: avatarImage1.src,
          alt: 'Emre Dönmez',
          width: avatarImage1.width,
          height: avatarImage1.height,
        },
        description:
          'Emre Dönmez, Pure Olentia kurucusu ve Q Grader sertifikalı kahve uzmanıdır. Kahve tedarik zinciri ve sürdürülebilirlik konularında 10 yılı aşkın deneyime sahiptir.',
      },
    },
    {
      id: '2',
      title: 'V60 ile Mükemmel Pour-Over Nasıl Yapılır?',
      handle: 'v60-pour-over-nasil-yapilir',
      excerpt:
        'Pour-over yöntemi ile kahvenizin tüm aroma notalarını ortaya çıkarabilirsiniz. Su sıcaklığından öğütme boyutuna, adım adım V60 demleme rehberi.',
      featuredImage: {
        src: blogImage2.src,
        alt: 'V60 pour-over demleme',
        width: 800,
        height: 533,
      },
      date: 'Şub 10, 2025',
      datetime: '2025-02-10',
      category: { title: 'Demleme', href: '#' },
      timeToRead: '4 dk okuma',
      author: {
        name: 'Ayşe Kara',
        avatar: {
          src: avatarImage2.src,
          alt: 'Ayşe Kara',
          width: avatarImage2.width,
          height: avatarImage2.height,
        },
        description:
          'Ayşe Kara, SCA sertifikalı barista eğitmeni ve Pure Olentia demleme uzmanıdır. Farklı demleme teknikleri konusunda workshoplar düzenlemektedir.',
      },
    },
    {
      id: '3',
      title: 'Etiyopya: Kahvenin Anavatanını Keşfedin',
      handle: 'etiyopya-kahvenin-anavatani',
      excerpt:
        'Kahvenin doğduğu topraklar olan Etiyopya, çiçeksi ve meyvemsi notalarıyla dünyada eşsiz bir yere sahiptir. Yirgacheffe, Sidamo ve Guji bölgelerinin hikayesi.',
      featuredImage: {
        src: blogImage3.src,
        alt: 'Etiyopya kahve tarlası',
        width: 800,
        height: 533,
      },
      date: 'Mar 05, 2025',
      datetime: '2025-03-05',
      category: { title: 'Menşei', href: '#' },
      timeToRead: '6 dk okuma',
      author: {
        name: 'Can Yılmaz',
        avatar: {
          src: avatarImage3.src,
          alt: 'Can Yılmaz',
          width: avatarImage3.width,
          height: avatarImage3.height,
        },
        description:
          'Can Yılmaz, yeşil kahve tedarik uzmanı ve Pure Olentia menşei araştırmacısıdır. Afrika ve Güney Amerika kahve bölgelerini düzenli olarak ziyaret etmektedir.',
      },
    },
    {
      id: '4',
      title: 'Kahvede İşleme Yöntemleri: Washed, Natural ve Honey',
      handle: 'kahve-isleme-yontemleri',
      excerpt:
        'Kahve çekirdeğinin işlenme şekli, fincanınızdaki tadı doğrudan etkiler. Yıkanmış, doğal ve bal işleme yöntemlerinin farklarını ve aroma profillerini öğrenin.',
      featuredImage: {
        src: blogImage4.src,
        alt: 'Kahve işleme yöntemleri',
        width: 800,
        height: 533,
      },
      date: 'Mar 20, 2025',
      datetime: '2025-03-20',
      category: { title: 'Kahve Bilimi', href: '#' },
      timeToRead: '5 dk okuma',
      author: {
        name: 'Elif Demir',
        avatar: {
          src: avatarImage4.src,
          alt: 'Elif Demir',
          width: avatarImage4.width,
          height: avatarImage4.height,
        },
        description:
          'Elif Demir, gıda mühendisi ve kahve bilimi araştırmacısıdır. Kavurma profilleri ve işleme yöntemleri üzerine akademik çalışmalar yapmaktadır.',
      },
    },
    {
      id: '5',
      title: 'Evde Espresso: Doğru Ekipman Seçimi',
      handle: 'evde-espresso-ekipman-secimi',
      excerpt:
        'Ev ortamında profesyonel kalitede espresso yapmak artık mümkün. Bütçenize ve ihtiyacınıza göre doğru öğütücü ve espresso makinesi nasıl seçilir?',
      featuredImage: {
        src: blogImage5.src,
        alt: 'Espresso ekipmanları',
        width: 800,
        height: 533,
      },
      date: 'Nis 01, 2025',
      datetime: '2025-04-01',
      category: { title: 'Ekipman', href: '#' },
      timeToRead: '4 dk okuma',
      author: {
        name: 'Emre Dönmez',
        avatar: {
          src: avatarImage1.src,
          alt: 'Emre Dönmez',
          width: avatarImage1.width,
          height: avatarImage1.height,
        },
        description:
          'Emre Dönmez, Pure Olentia kurucusu ve Q Grader sertifikalı kahve uzmanıdır. Kahve tedarik zinciri ve sürdürülebilirlik konularında 10 yılı aşkın deneyime sahiptir.',
      },
    },
    {
      id: '6',
      title: 'Sürdürülebilir Kahve: Tarladan Fincana İzlenebilirlik',
      handle: 'surdurulebilir-kahve-izlenebilirlik',
      excerpt:
        'Pure Olentia olarak kahvenin her aşamasını izlenebilir kılıyoruz. Çiftçiden kavurmacıya, lojistikten fincanınıza kadar tüm süreç şeffaf.',
      featuredImage: {
        src: blogImage6.src,
        alt: 'Kahve tarlası sürdürülebilirlik',
        width: 800,
        height: 533,
      },
      date: 'Nis 08, 2025',
      datetime: '2025-04-08',
      category: { title: 'Sürdürülebilirlik', href: '#' },
      timeToRead: '5 dk okuma',
      author: {
        name: 'Ayşe Kara',
        avatar: {
          src: avatarImage2.src,
          alt: 'Ayşe Kara',
          width: avatarImage2.width,
          height: avatarImage2.height,
        },
        description:
          'Ayşe Kara, SCA sertifikalı barista eğitmeni ve Pure Olentia demleme uzmanıdır. Farklı demleme teknikleri konusunda workshoplar düzenlemektedir.',
      },
    },
  ]
}
const BLOG_CONTENTS: Record<string, { content: string; tags: string[] }> = {
  'specialty-kahve-nedir-rehber': {
    tags: ['specialty', 'rehber', 'kahve kültürü'],
    content: `
      <p>Specialty kahve, Specialty Coffee Association (SCA) tarafından 100 puan üzerinden 80 ve üzeri puan alan kahvelere verilen isimdir. Bu puanlama; aroma, asidite, gövde, tatlılık, denge ve son tat gibi pek çok kriteri kapsar.</p>
      <h3>Specialty kahveyi diğerlerinden ayıran nedir?</h3>
      <p>Bir specialty kahvenin en önemli özelliği <strong>izlenebilirlik</strong>tir. Hangi ülkeden, hangi çiftlikten, hangi yükseklikten geldiğini, hatta kim tarafından toplandığını bile bilirsiniz. Pure Olentia olarak her çekirdeğin hikayesini paketin üzerinde paylaşıyoruz.</p>
      <ol>
        <li>Tek menşe (single origin) üretim</li>
        <li>El ile hasat ve seçici işleme</li>
        <li>Taze kavurma, taze tüketim (ideali 2-4 hafta)</li>
        <li>Doğru demleme yöntemiyle maksimum aroma</li>
      </ol>
      <h3>Yeni başlayanlar için ipuçları</h3>
      <p>Specialty kahveye yeni başlıyorsanız öneriniz orta kavrum bir <em>Colombia Supremo</em> veya <em>Brezilya Santos</em> ile başlamaktır. Bu kahveler dengeli yapıları ve kolay demlenebilir olmalarıyla öne çıkar.</p>
      <blockquote><p>"İyi kahve sadece bir içecek değil, bir zanaattır. Tarla ile fincan arasındaki her adım özeni gerektirir."</p></blockquote>
      <p>Specialty kahve yolculuğunuza Pure Olentia abonelik planları ile başlayabilir; her ay yeni bir menşei ve demleme rehberini kapınıza kadar getirebilirsiniz.</p>
    `,
  },
  'v60-pour-over-nasil-yapilir': {
    tags: ['v60', 'pour-over', 'demleme'],
    content: `
      <p>V60, Japon Hario firması tarafından tasarlanan ve dünya genelinde en popüler manuel demleme yöntemlerinden biri olan koni şeklinde bir filtredir. Doğru tekniklerle uygulandığında kahvenin aroma profilini öne çıkarır.</p>
      <h3>İhtiyacınız olan ekipmanlar</h3>
      <ul>
        <li>Hario V60 filtre (01 veya 02 boyut)</li>
        <li>V60 kağıt filtre</li>
        <li>Gooseneck (kuğu boyunlu) ibrik</li>
        <li>Hassas terazi (0.1 gr hassasiyetinde)</li>
        <li>Orta-ince öğütülmüş taze kahve</li>
      </ul>
      <h3>Adım adım V60 demleme</h3>
      <ol>
        <li><strong>Oran:</strong> 15 gram kahve, 250 ml su (1:16.5 oranı)</li>
        <li><strong>Su sıcaklığı:</strong> 92-94°C</li>
        <li><strong>Bloom:</strong> 30 ml su ile 30 saniye şişmeye bırakın</li>
        <li><strong>Ana dökme:</strong> Merkezden dışa spiral hareketlerle 100 ml ekleyin</li>
        <li><strong>İkinci dökme:</strong> 1:15'te 150 ml daha ekleyin</li>
        <li><strong>Toplam süre:</strong> 2:30 - 3:00 dakika arasında tamamlanmalı</li>
      </ol>
      <h3>Yaygın hatalar</h3>
      <p>Çok ince öğütme, acı bir kahveye; çok kaba öğütme ise zayıf ve sulu bir kahveye neden olur. İlk denemelerde öğütme boyutunu ayarlamak en kritik adımdır.</p>
      <blockquote><p>"V60, kahvenin karakterine bir mikrofon tutar; her nüansı duyurur."</p></blockquote>
    `,
  },
  'etiyopya-kahvenin-anavatani': {
    tags: ['etiyopya', 'yirgacheffe', 'menşei'],
    content: `
      <p>Kahve ağacının (Coffea arabica) doğal olarak yetiştiği tek yer Etiyopya'nın yüksek platolarıdır. Efsaneye göre Kaldi isimli bir çoban, keçilerinin kırmızı meyveler yedikten sonra enerjik olduklarını fark etmesiyle kahvenin keşfi başlamıştır.</p>
      <h3>Öne çıkan bölgeler</h3>
      <h4>Yirgacheffe</h4>
      <p>Çiçeksi, narenciye ve bergamot notalarıyla tanınan Yirgacheffe, ince gövdeli ve parlak asiditeli kahveleriyle specialty dünyasının en sevilen bölgelerinden biridir.</p>
      <h4>Sidamo</h4>
      <p>Sidamo kahveleri genellikle yaban mersini, çikolata ve tatlı meyve notalarına sahiptir. Doğal işleme (natural process) ile işlendiğinde özellikle karakterlidir.</p>
      <h4>Guji</h4>
      <p>Son yıllarda öne çıkan Guji, tropik meyve ve şeker kamışı tatlılığıyla yarışmalarda üst sıralara yerleşmektedir.</p>
      <h3>Etiyopya'da işleme</h3>
      <p>Etiyopya'nın çoğu kahvesi hâlâ küçük ölçekli çiftçiler tarafından elde toplanır ve yerel yıkama istasyonlarına (washing station) götürülür. Bu geleneksel yapı kaliteyi doğrudan yükseltir.</p>
      <blockquote><p>"Etiyopya fincanında bir çiçek bahçesi içtiğiniz hissi verir."</p></blockquote>
    `,
  },
  'kahve-isleme-yontemleri': {
    tags: ['işleme', 'washed', 'natural', 'honey'],
    content: `
      <p>Kahve meyvesi (cherry) toplandıktan sonra çekirdeğin meyveden ayrılması gerekir. Bu süreç <strong>işleme yöntemi</strong> olarak adlandırılır ve kahvenin fincanda aldığı tadı doğrudan etkiler.</p>
      <h3>Washed (Yıkanmış) İşleme</h3>
      <p>Meyve kabuğu hemen soyulur, çekirdekler fermantasyon tanklarında 12-72 saat bekletilir ve ardından yıkanır. Sonuç: <em>temiz, parlak, asiditesi yüksek</em> bir kahve. Colombia ve Kenya kahveleri çoğunlukla yıkanmış işlemle hazırlanır.</p>
      <h3>Natural (Doğal) İşleme</h3>
      <p>Çekirdek meyvenin içinde güneşte kurutulur (3-4 hafta). Meyvenin şekeri ve aroması çekirdeğe geçer. Sonuç: <em>yoğun, meyveli, şaraplı, tatlı</em> bir profil. Etiyopya ve Brezilya doğal işlemenin başkentleridir.</p>
      <h3>Honey (Bal) İşleme</h3>
      <p>Kabuk soyulur ama çekirdeğin üzerindeki yapışkan mucilage tabakası bırakılır. Ne kadar çok tabaka bırakıldığına göre <strong>white, yellow, red, black honey</strong> olarak isimlendirilir. Sonuç: <em>tatlılık ve gövde dengesi</em>. Costa Rica honey kahveleri en ünlüleridir.</p>
      <blockquote><p>"İşleme yöntemini bilmek, kahvenin karakterini önceden tahmin etmenin en iyi yoludur."</p></blockquote>
      <p>Pure Olentia arşivinde her üç yöntemle işlenmiş kahveleri deneyimleyebilir, hangi stilin damak tadınıza uyduğunu keşfedebilirsiniz.</p>
    `,
  },
  'evde-espresso-ekipman-secimi': {
    tags: ['espresso', 'ekipman', 'ev baristası'],
    content: `
      <p>Evde profesyonel kalitede espresso çekmek artık bir hayal değil. Ancak doğru ekipmanı seçmek ilk adım ve en kritik karardır.</p>
      <h3>Öğütücü: Espresso'nun kalbi</h3>
      <p>Espresso makinenizden önce <strong>iyi bir öğütücüye</strong> yatırım yapın. Ucuz bir öğütücü ile pahalı bir makine, mükemmel bir makine ile ucuz bir öğütücüden daha kötü sonuç verir. Önerilerimiz:</p>
      <ul>
        <li>Giriş: Eureka Mignon Specialità</li>
        <li>Orta: Niche Zero</li>
        <li>Pro: Mahlkönig E65S GbW</li>
      </ul>
      <h3>Espresso makinesi seçimi</h3>
      <ol>
        <li><strong>Yarı otomatik (semi-automatic):</strong> Baristanın müdahalesini gerektirir, öğrenmesi keyiflidir.</li>
        <li><strong>Tam otomatik (super-automatic):</strong> Tek tuşla espresso, pratik ama kişiselleştirme sınırlı.</li>
        <li><strong>Manuel kol (lever):</strong> Klasik deneyim, yüksek zanaat gerektirir.</li>
      </ol>
      <h3>Bütçe önerileri</h3>
      <p>10.000 TL altı: Rancilio Silvia + giriş seviye öğütücü. 10.000 - 25.000 TL: Lelit Bianca + Eureka Specialità. 25.000 TL üzeri: Profitec 600 + Niche Zero.</p>
      <blockquote><p>"İyi bir espresso için; taze kahve, iyi öğütücü ve sabit su sıcaklığı şarttır. Makine bu üçlünün sadece taşıyıcısıdır."</p></blockquote>
    `,
  },
  'surdurulebilir-kahve-izlenebilirlik': {
    tags: ['sürdürülebilirlik', 'izlenebilirlik', 'direct trade'],
    content: `
      <p>Pure Olentia'da kahvenin sadece fincanda değil, tarlada da iyi olmasını önemsiyoruz. Sürdürülebilirlik bizim için pazarlama değil, iş modelinin merkezidir.</p>
      <h3>Direct Trade — doğrudan ticaret</h3>
      <p>Kahvemizi büyük aracı kurumlardan değil, doğrudan üreticiden satın alıyoruz. Bu sayede çiftçi piyasa fiyatının <strong>2-3 katı</strong> prim alıyor ve kaliteye yatırım yapabilecek kaynağa kavuşuyor.</p>
      <h3>İzlenebilirlik — tarladan fincana</h3>
      <ul>
        <li>Her paketin üzerinde hasat tarihi</li>
        <li>Çiftçi/kooperatif adı ve fotoğrafı</li>
        <li>Yükseklik, çeşit (varietal) ve işleme yöntemi</li>
        <li>Kavurma tarihi ve tavsiye edilen tüketim aralığı</li>
      </ul>
      <h3>Çevresel etki</h3>
      <p>Kullandığımız tüm ambalajlar geri dönüştürülebilir malzemelerden üretilir. Kahve telvelerini kompost programımız kapsamında yerel bahçelerde gübre olarak değerlendiriyoruz.</p>
      <h3>Sosyal etki</h3>
      <p>Her yıl gelirin %2'sini kahve üreticilerinin çocuklarının eğitimi için kullanılan bursa aktarıyoruz. Amacımız sadece iyi kahve değil, iyi bir gelecek.</p>
      <blockquote><p>"Sürdürülebilirlik bir pazarlama terimi değil, sorumluluk sahibi bir işin doğal sonucudur."</p></blockquote>
    `,
  },
}

export async function getBlogPostsByHandle(handle: string) {
  // lower case the handle
  handle = handle.toLowerCase()

  const posts = await getBlogPosts()
  let post = posts.find((post) => post.handle === handle)

  if (!post) {
    console.warn(`Post with handle ${handle} not found. Returning the first post as a fallback.`)
    post = posts[0]
  }

  const extras = BLOG_CONTENTS[post.handle] || {
    content:
      '<p>Bu yazının içeriği yakında eklenecek. Pure Olentia blog arşivini takip ettiğiniz için teşekkürler.</p>',
    tags: ['kahve'],
  }

  return {
    ...post,
    content: extras.content,
    tags: extras.tags,
  }
}

export function getCart(id: string) {
  return {
    id: 'gid://shopify/Cart/1',
    note: 'This is a note',
    createdAt: '2025-01-06',
    totalQuantity: 4,
    cost: {
      subtotal: 199,
      shipping: 0,
      tax: 0,
      total: 199,
      discount: 0,
    },
    lines: [
      {
        id: '1',
        name: 'Ethiopia Yirgacheffe',
        handle: 'ethiopia-yirgacheffe',
        price: 189,
        color: 'Açık Kavurma',
        inStock: true,
        size: '250g',
        quantity: 1,
        image: {
          src: productImage1.src,
          width: productImage1.width,
          height: productImage1.height,
          alt: 'Ethiopia Yirgacheffe kahve paketi',
        },
      },
      {
        id: '2',
        name: 'Colombia Supremo',
        handle: 'colombia-supremo',
        price: 159,
        color: 'Orta Kavurma',
        inStock: false,
        leadTime: '3–5 gün',
        size: '500g',
        quantity: 2,
        image: {
          src: productImage2.src,
          width: productImage2.width,
          height: productImage2.height,
          alt: 'Colombia Supremo kahve paketi',
        },
      },
      {
        id: '3',
        name: 'Brazil Santos',
        handle: 'brazil-santos',
        price: 129,
        color: 'Orta-Koyu Kavurma',
        inStock: true,
        size: '1kg',
        quantity: 1,
        image: {
          src: productImage3.src,
          width: productImage3.width,
          height: productImage3.height,
          alt: 'Brazil Santos kahve paketi',
        },
      },
    ],
  }
}

// ------------------------  DATA ------------------------
export async function getCollections() {
  return [
    // default collections 1 - 7
    {
      id: 'gid://1',
      title: 'Single Origin',
      handle: 'single-origin',
      description: 'Tek menşeili özel kahveler. Her biri benzersiz bir aroma profili sunar.',
      sortDescription: 'En yeniler',
      color: 'bg-primary-50',
      count: 24,
      image: {
        src: collectionImage1.src,
        width: collectionImage1.width,
        height: collectionImage1.height,
        alt: 'Single Origin kahveler',
      },
    },
    {
      id: 'gid://2',
      title: 'Blend',
      handle: 'blend',
      sortDescription: 'Çok satanlar',
      description: 'Ustaca harmanlanmış kahveler. Dengeli ve tutarlı lezzet deneyimi.',
      image: {
        src: collectionImage2.src,
        width: collectionImage2.width,
        height: collectionImage2.height,
        alt: 'Explore new arrivals',
      },
      color: 'bg-indigo-50',
      count: 155,
    },
    {
      id: 'gid://3',
      title: 'Espresso',
      handle: 'espresso',
      sortDescription: 'En popüler',
      description: 'Espresso için özel olarak kavrulmuş, yoğun ve kremamsı kahveler.',
      image: {
        src: collectionImage3.src,
        width: collectionImage3.width,
        height: collectionImage3.height,
        alt: 'Espresso kahveler',
      },
      color: 'bg-primary-50',
      count: 18,
    },
    {
      id: 'gid://4',
      title: 'Filtre Kahve',
      handle: 'filter',
      sortDescription: 'Mevsimin favorisi',
      description: 'Pour-over, French Press ve filtre demleme için ideal açık-orta kavurma kahveler.',
      image: {
        src: collectionImage4.src,
        width: collectionImage4.width,
        height: collectionImage4.height,
        alt: 'Filtre kahveler',
      },
      color: 'bg-primary-50',
      count: 22,
    },
    {
      id: 'gid://5',
      title: 'Öğütücüler',
      handle: 'grinders',
      sortDescription: 'En çok değerlendirilen',
      description: 'Manuel ve elektrikli öğütücüler. Taze öğütülmüş kahvenin farkını yaşayın.',
      image: {
        src: collectionImage5.src,
        width: collectionImage5.width,
        height: collectionImage5.height,
        alt: 'Kahve öğütücüler',
      },
      color: 'bg-secondary-50',
      count: 12,
    },
    {
      id: 'gid://6',
      title: 'Demleme Ekipmanları',
      handle: 'brewers',
      sortDescription: 'Profesyonel kalite',
      description: 'V60, Chemex, AeroPress ve daha fazlası. Evinizi bir kahve laboratuvarına dönüştürün.',
      image: {
        src: collectionImage6.src,
        width: collectionImage6.width,
        height: collectionImage6.height,
        alt: 'Demleme ekipmanları',
      },
      color: 'bg-secondary-50',
      count: 15,
    },
    {
      id: 'gid://7',
      title: 'Aksesuarlar',
      handle: 'accessories',
      sortDescription: 'Tamamlayıcılar',
      description: 'Tartı, kettle, fincan ve kahve aksesuarları. Deneyiminizi tamamlayın.',
      image: {
        src: collectionImage7.src,
        width: collectionImage7.width,
        height: collectionImage7.height,
        alt: 'Kahve aksesuarları',
      },
      color: 'bg-secondary-50',
      count: 20,
    },

    //  Featured collections 8 - 11
    {
      id: 'gid://8',
      title: 'Yeni Gelen Mahsuller',
      handle: 'new-arrivals',
      sortDescription: 'En taze <br /> hasat kahveler',
      description: 'Bu sezonun en taze hasatlarından seçilmiş özel kahveler. Sınırlı sayıda.',
      color: 'bg-primary-50',
      count: 8,
      image: {
        src: collectionImage5.src,
        width: collectionImage5.width,
        height: collectionImage5.height,
        alt: 'Yeni mahsul kahveler',
      },
    },
    {
      id: 'gid://9',
      title: 'İndirimli Kahveler',
      handle: 'sale-collection',
      sortDescription: '%30\'a varan <br /> indirimler',
      description: 'Seçili kahvelerde ve ekipmanlarda özel fiyatlar. Fırsatı kaçırmayın.',
      color: 'bg-green-50',
      count: 14,
      image: {
        src: collectionImage4.src,
        width: collectionImage4.width,
        height: collectionImage4.height,
        alt: 'İndirimli kahveler',
      },
    },
    {
      id: 'gid://10',
      title: 'Abonelik Paketleri',
      handle: 'subscription-packs',
      sortDescription: 'Aylık taze <br /> kahve teslimatı',
      description: 'Her ay kapınıza özenle seçilmiş taze kahveler. Farklı planlar mevcut.',
      color: 'bg-blue-50',
      count: 6,
      image: {
        src: collectionImage3.src,
        width: collectionImage3.width,
        height: collectionImage3.height,
        alt: 'Abonelik paketleri',
      },
    },
    {
      id: 'gid://11',
      title: 'Hediye Kartları',
      handle: 'gift-cards',
      sortDescription: 'Kahve severlere <br /> en güzel hediye',
      description: 'Dijital hediye kartları ile sevdiklerinize kahve deneyimi hediye edin.',
      color: 'bg-red-50',
      count: 4,
      image: {
        src: collectionImage2.src,
        width: collectionImage2.width,
        height: collectionImage2.height,
        alt: 'Hediye kartları',
      },
    },

    // Brand/Category collections 12 - 15
    {
      id: 'gid://12',
      title: 'Etiyopya Kahveleri',
      handle: 'ethiopia',
      sortDescription: '10+ çeşit',
      description: 'Kahvenin anavatanından çiçeksi ve meyvemsi notalarla dolu özel kahveler.',
      color: 'bg-neutral-100',
      count: 10,
      image: {
        src: boothImage1.src,
        width: boothImage1.width,
        height: boothImage1.height,
        alt: 'Etiyopya kahveleri',
      },
    },
    {
      id: 'gid://13',
      title: 'Kolombiya Kahveleri',
      handle: 'colombia',
      color: 'bg-neutral-100',
      sortDescription: '8+ çeşit',
      description: 'Dengeli asidite, karamel ve fındık notalarıyla tanınan Kolombiya kahveleri.',
      count: 8,
      image: {
        src: boothImage2.src,
        width: boothImage2.width,
        height: boothImage2.height,
        alt: 'Kolombiya kahveleri',
      },
    },
    {
      id: 'gid://14',
      title: 'Brezilya Kahveleri',
      handle: 'brazil',
      sortDescription: '6+ çeşit',
      description: 'Çikolata ve fındık ağırlıklı, düşük asidite ile yumuşak içimli Brezilya kahveleri.',
      color: 'bg-neutral-100',
      count: 6,
      image: {
        src: boothImage3.src,
        width: boothImage3.width,
        height: boothImage3.height,
        alt: 'Brezilya kahveleri',
      },
    },
    {
      id: 'gid://15',
      title: 'Kenya Kahveleri',
      handle: 'kenya',
      sortDescription: '5+ çeşit',
      description: 'Canlı asidite ve meyve notalarıyla Afrika kahve kültürünün en iyisi.',
      color: 'bg-neutral-100',
      count: 5,
      image: {
        src: boothImage4.src,
        width: boothImage4.width,
        height: boothImage4.height,
        alt: 'Kenya kahveleri',
      },
    },
  ]
}

export async function getGroupCollections() {
  const allCollections = await getCollections()
  const collections = allCollections.slice(0, 6)
  return [
    {
      id: '1',
      title: 'Menşei',
      handle: 'origin',
      description: 'Ülkeye göre kahveler',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 12H22" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 2C9.5 4.5 8 8 8 12C8 16 9.5 19.5 12 22" stroke="currentColor" stroke-width="1.5"/>
              </svg>`,
      collections,
    },
    {
      id: '2',
      title: 'Kavurma',
      handle: 'roast',
      description: 'Kavurma profiline göre',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 8 6 8 10C8 12.2091 9.79086 14 12 14C14.2091 14 16 12.2091 16 10C16 6 12 2 12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 14V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M8 19H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>`,
      collections: shuffleArray(collections),
    },
    {
      id: '3',
      title: 'İşleme',
      handle: 'process',
      description: 'İşleme yöntemine göre',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M3 8H21V8C21 13.5228 17.5228 17 12 17C6.47715 17 3 13.5228 3 8V8Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 20H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M12 17V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>`,
      collections: shuffleArray(collections),
    },
    {
      id: '4',
      title: 'Demleme',
      handle: 'brewing',
      description: 'Demleme yöntemine göre',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4L18 4L15 20H9L6 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M4 4H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M10 9L14 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>`,
      collections: shuffleArray(collections),
    },
    {
      id: '5',
      title: 'Ekipmanlar',
      handle: 'equipment',
      description: 'Demleme ekipmanları',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M9 14H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>`,
      collections: shuffleArray(collections),
    },
    {
      id: '6',
      title: 'Hediye',
      handle: 'gifts',
      description: 'Hediye setleri ve kartlar',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12V22H4V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 7H2V12H22V7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 22V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      collections: shuffleArray(collections),
    },
  ]
}

export async function getCollectionByHandle(handle: string) {
  // lowercase handle
  handle = handle.toLowerCase()
  // const all products slug: /collections/all
  if (handle === 'all') {
    return {
      id: 'gid://all',
      title: 'Tüm Ürünler',
      handle: 'all',
      description: 'Pure Olentia kahve koleksiyonunu keşfedin. Taze kavrulmuş specialty kahveler.',
      sortDescription: 'Tüm Ürünler',
      color: 'bg-indigo-50',
      count: 77,
      image: {
        src: collectionImage1.src,
        width: collectionImage1.width,
        height: collectionImage1.height,
        alt: 'Tüm kahveler',
      },
    }
  }

  const allCollections = await getCollections()
  let collection = allCollections?.find((collection) => collection?.handle === handle)

  if (!collection) {
    //  throw new Error(`Collection with handle "${handle}" not found`)

    // for demo purposes, return a default collection
    collection = allCollections[0] // fallback to the first collection
  }

  return collection
}

export async function getProducts() {
  return [
    {
      id: 'gid://1001',
      title: 'Ethiopia Yirgacheffe',
      handle: 'ethiopia-yirgacheffe',
      createdAt: '2025-05-06T10:00:00-04:00',
      vendor: 'Etiyopya',
      price: 85,
      featuredImage: {
        src: productImage1.src,
        width: productImage1.width,
        height: productImage1.height,
        alt: 'Ethiopia Yirgacheffe',
      },
      images: [
        {
          src: productImage1.src,
          width: productImage1.width,
          height: productImage1.height,
          alt: 'Ethiopia Yirgacheffe',
        },
        {
          src: productImage1_1.src,
          width: productImage1_1.width,
          height: productImage1_1.height,
          alt: 'Ethiopia Yirgacheffe',
        },
        {
          src: productImage1_2.src,
          width: productImage1_2.width,
          height: productImage1_2.height,
          alt: 'Ethiopia Yirgacheffe',
        },
        {
          src: productImage1_3.src,
          width: productImage1_3.width,
          height: productImage1_3.height,
          alt: 'Ethiopia Yirgacheffe',
        },
      ],
      reviewNumber: 87,
      rating: 4.5,
      status: 'Yeni Mahsul',
      options: [
        {
          name: 'Kavurma',
          optionValues: [
            {
              name: 'Koyu Kavurma',
              swatch: {
                color: '#000000',
                image: null,
              },
            },
            {
              swatch: {
                color: 'oklch(42.1% 0.095 57.708)',
                image: null,
              },
              name: 'Orta Kavurma',
            },
            {
              swatch: {
                color: '#D1C9C1',
                image: null,
              },
              name: 'Açık Kavurma',
            },
            {
              swatch: {
                color: '#f7e3d4',
                image: null,
              },
              name: 'Orta-Koyu',
            },
          ],
        },
        {
          name: 'Gramaj',
          optionValues: [
            {
              swatch: null,
              name: '100g',
            },
            {
              swatch: null,
              name: '250g',
            },
            {
              swatch: null,
              name: '500g',
            },
            {
              swatch: null,
              name: '1kg',
            },
            {
              swatch: null,
              name: '2kg',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Kavurma',
          value: 'Orta Kavurma',
        },
        {
          name: 'Gramaj',
          value: '250g',
        },
      ],
    },
    {
      id: 'gid://1002',
      title: 'Colombia Supremo',
      handle: 'colombia-supremo',
      createdAt: '2025-05-07T09:30:00-04:00',
      vendor: 'Kolombiya',
      price: 120,
      featuredImage: {
        src: productImage2.src,
        width: productImage2.width,
        height: productImage2.height,
        alt: 'Colombia Supremo',
      },
      images: [
        {
          src: productImage2.src,
          width: productImage2.width,
          height: productImage2.height,
          alt: 'Colombia Supremo',
        },
        {
          src: productImage2_1.src,
          width: productImage2_1.width,
          height: productImage2_1.height,
          alt: 'Colombia Supremo',
        },
        {
          src: productImage2_2.src,
          width: productImage2_2.width,
          height: productImage2_2.height,
          alt: 'Colombia Supremo',
        },
        {
          src: productImage2_3.src,
          width: productImage2_3.width,
          height: productImage2_3.height,
          alt: 'Colombia Supremo',
        },
      ],
      reviewNumber: 95,
      rating: 4.7,
      status: 'Best Seller',
      options: [
        {
          name: 'Kavurma',
          optionValues: [
            {
              name: 'Emerald Green',
              swatch: {
                color: '#2E8B57',
                image: null,
              },
            },
            {
              name: 'Ivory',
              swatch: {
                color: 'oklch(84.1% 0.238 128.85)',
                image: null,
              },
            },
            {
              name: 'Navy Blue',
              swatch: {
                color: '#000080',
                image: null,
              },
            },
            {
              name: 'Coral',
              swatch: {
                color: '#FF7F50',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Gramaj',
          optionValues: [
            {
              swatch: null,
              name: '250g',
            },
            {
              swatch: null,
              name: 'S',
            },
            {
              swatch: null,
              name: '500g',
            },
            {
              swatch: null,
              name: '1kg',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Kavurma',
          value: 'Emerald Green',
        },
        {
          name: 'Gramaj',
          value: 'S',
        },
      ],
    },
    {
      id: 'gid://1003',
      title: 'Brazil Santos',
      handle: 'brazil-santos',
      createdAt: '2025-05-08T11:15:00-04:00',
      vendor: 'UrbanTrend',
      price: 65,
      featuredImage: {
        src: productImage3.src,
        width: productImage3.width,
        height: productImage3.height,
        alt: 'Brazil Santos',
      },
      images: [
        {
          src: productImage3.src,
          width: productImage3.width,
          height: productImage3.height,
          alt: 'Brazil Santos',
        },
        {
          src: productImage3_1.src,
          width: productImage3_1.width,
          height: productImage3_1.height,
          alt: 'Brazil Santos',
        },
        {
          src: productImage3_2.src,
          width: productImage3_2.width,
          height: productImage3_2.height,
          alt: 'Brazil Santos',
        },
        {
          src: productImage3_3.src,
          width: productImage3_3.width,
          height: productImage3_3.height,
          alt: 'Brazil Santos',
        },
      ],
      reviewNumber: 120,
      rating: 4.3,
      status: 'Yeni Mahsul',
      options: [
        {
          name: 'Kavurma',
          optionValues: [
            {
              name: 'Light Blue',
              swatch: {
                color: '#ADD8E6',
                image: null,
              },
            },
            {
              name: 'Dark Blue',
              swatch: {
                color: '#00008B',
                image: null,
              },
            },
            {
              name: 'Koyu Kavurma',
              swatch: {
                color: '#000000',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Gramaj',
          optionValues: [
            {
              swatch: null,
              name: 'S',
            },
            {
              swatch: null,
              name: '500g',
            },
            {
              swatch: null,
              name: '1kg',
            },
            {
              swatch: null,
              name: '2kg',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Kavurma',
          value: 'Light Blue',
        },
        {
          name: 'Gramaj',
          value: 'M',
        },
      ],
    },
    {
      id: 'gid://1004',
      title: 'Kenya AA Nyeri',
      handle: 'kenya-aa-nyeri',
      createdAt: '2025-05-09T14:20:00-04:00',
      vendor: 'SoftLux',
      price: 150,
      featuredImage: {
        src: productImage4.src,
        width: productImage4.width,
        height: productImage4.height,
        alt: 'Kenya AA Nyeri',
      },
      images: [
        {
          src: productImage4.src,
          width: productImage4.width,
          height: productImage4.height,
          alt: 'Kenya AA Nyeri',
        },
        {
          src: productImage4_1.src,
          width: productImage4_1.width,
          height: productImage4_1.height,
          alt: 'Kenya AA Nyeri',
        },
        {
          src: productImage4_2.src,
          width: productImage4_2.width,
          height: productImage4_2.height,
          alt: 'Kenya AA Nyeri',
        },
        {
          src: productImage4_3.src,
          width: productImage4_3.width,
          height: productImage4_3.height,
          alt: 'Kenya AA Nyeri',
        },
      ],
      reviewNumber: 75,
      rating: 4.8,
      status: 'Limited Edition',
      options: [
        {
          name: 'Kavurma',
          optionValues: [
            {
              name: 'Charcoal',
              swatch: {
                color: '#36454F',
                image: null,
              },
            },
            {
              name: 'Cream',
              swatch: {
                color: 'oklch(81% 0.117 11.638)',
                image: null,
              },
            },
            {
              name: 'Burgundy',
              swatch: {
                color: '#800020',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Gramaj',
          optionValues: [
            {
              swatch: null,
              name: '250g',
            },
            {
              swatch: null,
              name: 'S',
            },
            {
              swatch: null,
              name: '500g',
            },
            {
              swatch: null,
              name: '1kg',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Kavurma',
          value: 'Cream',
        },
        {
          name: 'Gramaj',
          value: 'M',
        },
      ],
    },
    {
      id: 'gid://1005',
      title: 'Guatemala Antigua',
      handle: 'guatemala-antigua',
      createdAt: '2025-05-10T08:45:00-04:00',
      vendor: 'TailoredFit',
      price: 95,
      featuredImage: {
        src: productImage5.src,
        width: productImage5.width,
        height: productImage5.height,
        alt: 'Guatemala Antigua',
      },
      images: [
        {
          src: productImage5.src,
          width: productImage5.width,
          height: productImage5.height,
          alt: 'Guatemala Antigua',
        },
        {
          src: productImage5_1.src,
          width: productImage5_1.width,
          height: productImage5_1.height,
          alt: 'Guatemala Antigua',
        },
        {
          src: productImage5_2.src,
          width: productImage5_2.width,
          height: productImage5_2.height,
          alt: 'Guatemala Antigua',
        },
        {
          src: productImage5_3.src,
          width: productImage5_3.width,
          height: productImage5_3.height,
          alt: 'Guatemala Antigua',
        },
      ],
      reviewNumber: 60,
      rating: 4.4,
      status: 'Yeni Mahsul',
      options: [
        {
          name: 'Kavurma',
          optionValues: [
            {
              name: 'Beige',
              swatch: {
                color: '#F5F5DC',
                image: null,
              },
            },
            {
              name: 'Navy',
              swatch: {
                color: '#000080',
                image: null,
              },
            },
            {
              name: 'Olive',
              swatch: {
                color: '#808000',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Gramaj',
          optionValues: [
            {
              swatch: null,
              name: '500g',
            },
            {
              swatch: null,
              name: '1kg',
            },
            {
              swatch: null,
              name: '2kg',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Kavurma',
          value: 'Beige',
        },
        {
          name: 'Gramaj',
          value: 'L',
        },
      ],
    },
    {
      id: 'gid://1006',
      title: 'Espresso Blend',
      handle: 'espresso-blend',
      createdAt: '2025-05-11T12:10:00-04:00',
      vendor: 'GlamVibe',
      price: 55,
      featuredImage: {
        src: productImage6.src,
        width: productImage6.width,
        height: productImage6.height,
        alt: 'Espresso Blend',
      },
      images: [
        {
          src: productImage6.src,
          width: productImage6.width,
          height: productImage6.height,
          alt: 'Espresso Blend',
        },
        {
          src: productImage6_1.src,
          width: productImage6_1.width,
          height: productImage6_1.height,
          alt: 'Espresso Blend',
        },
        {
          src: productImage6_2.src,
          width: productImage6_2.width,
          height: productImage6_2.height,
          alt: 'Espresso Blend',
        },
        {
          src: productImage6_3.src,
          width: productImage6_3.width,
          height: productImage6_3.height,
          alt: 'Espresso Blend',
        },
      ],
      reviewNumber: 45,
      rating: 4.2,
      status: 'Trending',
      options: [
        {
          name: 'Kavurma',
          optionValues: [
            {
              name: 'Midnight Blue',
              swatch: {
                color: '#191970',
                image: null,
              },
            },
            {
              name: 'Wine Red',
              swatch: {
                color: '#722F37',
                image: null,
              },
            },
            {
              name: 'Emerald',
              swatch: {
                color: '#50C878',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Gramaj',
          optionValues: [
            {
              swatch: null,
              name: '250g',
            },
            {
              swatch: null,
              name: 'S',
            },
            {
              swatch: null,
              name: '500g',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Kavurma',
          value: 'Wine Red',
        },
        {
          name: 'Gramaj',
          value: 'S',
        },
      ],
    },
    {
      id: 'gid://1007',
      title: 'V60 Filtre Özel',
      handle: 'v60-filtre-ozel',
      createdAt: '2025-05-12T10:25:00-04:00',
      vendor: 'ClassicCharm',
      price: 180,
      featuredImage: {
        src: productImage7.src,
        width: productImage7.width,
        height: productImage7.height,
        alt: 'V60 Filtre Özel',
      },
      images: [
        {
          src: productImage7.src,
          width: productImage7.width,
          height: productImage7.height,
          alt: 'V60 Filtre Özel',
        },
        {
          src: productImage7_1.src,
          width: productImage7_1.width,
          height: productImage7_1.height,
          alt: 'V60 Filtre Özel',
        },
        {
          src: productImage7_2.src,
          width: productImage7_2.width,
          height: productImage7_2.height,
          alt: 'V60 Filtre Özel',
        },
        {
          src: productImage7_3.src,
          width: productImage7_3.width,
          height: productImage7_3.height,
          alt: 'V60 Filtre Özel',
        },
      ],
      reviewNumber: 80,
      rating: 4.6,
      status: 'Yeni Mahsul',
      options: [
        {
          name: 'Kavurma',
          optionValues: [
            {
              name: 'Camel',
              swatch: {
                color: '#C19A6B',
                image: null,
              },
            },
            {
              name: 'Koyu Kavurma',
              swatch: {
                color: '#000000',
                image: null,
              },
            },
            {
              name: 'Grey',
              swatch: {
                color: '#808080',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Gramaj',
          optionValues: [
            {
              swatch: null,
              name: 'S',
            },
            {
              swatch: null,
              name: '500g',
            },
            {
              swatch: null,
              name: '1kg',
            },
            {
              swatch: null,
              name: '2kg',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Kavurma',
          value: 'Camel',
        },
        {
          name: 'Gramaj',
          value: 'M',
        },
      ],
    },
    {
      id: 'gid://1008',
      title: 'Abonelik Kutusu',
      handle: 'abonelik-kutusu',
      createdAt: '2025-05-13T09:00:00-04:00',
      vendor: 'CasualVibe',
      price: 45,
      featuredImage: {
        src: productImage8.src,
        width: productImage8.width,
        height: productImage8.height,
        alt: 'Abonelik Kutusu',
      },
      images: [
        {
          src: productImage8.src,
          width: productImage8.width,
          height: productImage8.height,
          alt: 'Abonelik Kutusu',
        },
        {
          src: productImage8_1.src,
          width: productImage8_1.width,
          height: productImage8_1.height,
          alt: 'Abonelik Kutusu',
        },
        {
          src: productImage8_2.src,
          width: productImage8_2.width,
          height: productImage8_2.height,
          alt: 'Abonelik Kutusu',
        },
        {
          src: productImage8_3.src,
          width: productImage8_3.width,
          height: productImage8_3.height,
          alt: 'Abonelik Kutusu',
        },
      ],
      reviewNumber: 110,
      rating: 4.1,
      status: 'Best Seller',
      options: [
        {
          name: 'Kavurma',
          optionValues: [
            {
              name: 'White',
              swatch: {
                color: 'oklch(81% 0.117 11.638)',
                image: null,
              },
            },
            {
              name: 'Light Blue',
              swatch: {
                color: '#ADD8E6',
                image: null,
              },
            },
            {
              name: 'Pink',
              swatch: {
                color: '#FFC1CC',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Gramaj',
          optionValues: [
            {
              swatch: null,
              name: 'S',
            },
            {
              swatch: null,
              name: '500g',
            },
            {
              swatch: null,
              name: '1kg',
            },
          ],
        },
      ],
      selectedOptions: [
        {
          name: 'Kavurma',
          value: 'White',
        },
        {
          name: 'Gramaj',
          value: 'M',
        },
      ],
    },
  ]
}

export async function getProductByHandle(handle: string) {
  // lowercase handle
  handle = handle.toLowerCase()

  const products = await getProducts()
  let product = products.find((product) => product.handle === handle)

  if (!product) {
    // throw new Error(`Product with handle "${handle}" not found.`)

    // for demo purposes, we are using a static product detail
    product = products[0] // fallback to the first product
  }

  return product
}

// get product by handle
export async function getProductDetailByHandle(handle: string) {
  // lowercase handle
  handle = handle.toLowerCase()

  // for demo purposes, we are using a static product detail
  const product = await getProductByHandle(handle)

  // if ( !product?.id ) {
  //   throw new Error(`Product with handle "${handle}" not found.`)
  // }

  return {
    ...product,
    status: 'Stokta',
    breadcrumbs: [
      { id: 1, name: 'Ana Sayfa', href: '/' },
      { id: 2, name: 'Kahveler', href: '/collections/all' },
    ],
    description:
      'Özenle seçilmiş, tek menşeili specialty kahve. Tarladan fincana izlenebilir süreçle üretilmiş, sipariş üzerine taze kavrulmuş premium kahve deneyimi. Her paketin üzerinde menşei, çiftçi, işleme yöntemi ve kavurma tarihi bilgileri yer almaktadır.',
    publishedAt: '2019-03-27T17:43:25Z',
    selectedOptions: [
      {
        name: 'Kavurma',
        value: product?.options.find((option) => option.name === 'Kavurma')?.optionValues[1].name,
      },
      {
        name: 'Gramaj',
        value: product?.options.find((option) => option.name === 'Gramaj')?.optionValues[0].name,
      },
    ],
    features: [
      'Menşei: Tek bölge, izlenebilir kaynak',
      'Kavurma: Sipariş üzerine taze kavrulur',
      'İşleme: Yıkanmış (Washed) yöntemi',
      'Aroma Notaları: Çiçeksi, meyvemsi ve tatlı',
    ],
    careInstruction:
      'Serin ve kuru bir yerde, hava almayan kapta saklayın. Kavurma tarihinden itibaren 4 hafta içinde tüketilmesi önerilir. Öğütülmüş kahve 2 hafta içinde tüketilmelidir.',
    shippingAndReturn:
      '₺300 üzeri siparişlerde ücretsiz kargo. Kapalı ve açılmamış ürünlerde 14 gün iade hakkı mevcuttur.',
  }
}

// COMMON Types ------------------------------------------------------------------------
export type TCollection = Partial<Awaited<ReturnType<typeof getCollections>>[number]>
export type TProductItem = Partial<Awaited<ReturnType<typeof getProducts>>[number]>
export type TProductDetail = Partial<Awaited<ReturnType<typeof getProductDetailByHandle>>>
export type TCardProduct = Partial<Awaited<ReturnType<typeof getCart>['lines'][number]>>
export type TBlogPost = Partial<Awaited<ReturnType<typeof getBlogPosts>>[number]>
export type TReview = Partial<Awaited<ReturnType<typeof getProductReviews>>[number]>
export type TOrder = Partial<Awaited<ReturnType<typeof getOrders>>[number]>
