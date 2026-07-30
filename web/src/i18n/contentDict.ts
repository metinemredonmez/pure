// İçerik (admin/veritabanı metni) için dahili TR→EN sözlüğü.
// Menü, kategori ve bölüm başlıkları gibi STANDART içerik metinleri burada
// çevrilir — admin'e ayrı EN alanı girmeden çalışır. Eşleşme yoksa TR kalır.
// (Ürün adı/açıklaması gibi serbest içerik için Faz 2 — admin EN alanı gerekir.)

const CONTENT_EN: Record<string, string> = {
  // Ana menü
  'Kahveler': 'Coffees',
  'Kahve': 'Coffee',
  'Abonelik': 'Subscription',
  'Abonelikler': 'Subscriptions',
  'Online Dükkan': 'Online Store',
  'Online Dükkân': 'Online Store',
  'Dükkan': 'Store',
  'Keşfet': 'Explore',
  'Kurumsal': 'Corporate',
  'İletişim': 'Contact',
  'Anasayfa': 'Home',
  'Ana Sayfa': 'Home',
  'Hakkımızda': 'About Us',
  'Blog': 'Blog',
  'Kampanyalar': 'Campaigns',
  'Menşeiler': 'Origins',
  'Menşeler': 'Origins',
  'Kahve Okulu': 'Coffee School',
  'Kahve Sözlüğü': 'Coffee Glossary',
  'Sürdürülebilirlik': 'Sustainability',
  'Referanslar': 'References',
  'Franchise': 'Franchise',
  'Toptan Satış': 'Wholesale',
  'Kurumsal Hediye': 'Corporate Gifts',
  'Sadakat': 'Loyalty',
  // Kategoriler (kahve türleri)
  'Türk Kahvesi': 'Turkish Coffee',
  'Filtre Kahve': 'Filter Coffee',
  'Espresso': 'Espresso',
  'Çekirdek Kahve': 'Whole Bean Coffee',
  'Öğütülmüş Kahve': 'Ground Coffee',
  'Yeşil Kahve': 'Green Coffee',
  'Aromalı Kahve': 'Flavored Coffee',
  'Tümü': 'All',
  'Tüm Kahveler': 'All Coffees',
  // Sık geçen bölüm/etiketler
  'Öne Çıkanlar': 'Featured',
  'Çok Satanlar': 'Best Sellers',
  'Yeni Ürünler': 'New Products',
  'İndirimdekiler': 'On Sale',
}

/** locale='en' ise TR metnin İngilizcesini döndür; eşleşme yoksa metni aynen döndür. */
export function translateContent(text: string | undefined | null, locale: string): string {
  const s = String(text ?? '')
  if (locale !== 'en') return s
  return CONTENT_EN[s.trim()] ?? s
}
