// Hafif i18n sözlüğü (Faz 1 — arayüz metinleri).
// Bileşenler t('anahtar', 'Türkçe varsayılan') ile kullanır. Bir anahtar
// çevrilmemişse TR'ye, o da yoksa verilen varsayılana düşer — hiçbir şey bozulmaz.

export type Locale = 'tr' | 'en'

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

type Dict = Record<string, string>

const tr: Dict = {
  // Genel / butonlar
  'common.add_to_cart': 'Sepete Ekle',
  'common.buy_now': 'Hemen Al',
  'common.checkout': 'Ödemeye Geç',
  'common.continue_shopping': 'Alışverişe Devam Et',
  'common.start_shopping': 'Alışverişe Başla',
  'common.view_all': 'Hepsini Gör',
  'common.apply': 'Uygula',
  'common.remove': 'Kaldır',
  'common.save': 'Kaydet',
  'common.cancel': 'İptal',
  'common.loading': 'Yükleniyor...',
  'common.search': 'Ara',
  'common.language': 'Dil',
  'common.currency': 'Para Birimi',
  'common.price_from': "{price}'ten başlayan",
  // Sepet
  'cart.title': 'Sepetim',
  'cart.empty': 'Sepetiniz boş',
  'cart.empty_desc': 'Ödeme yapabilmek için sepetinize ürün ekleyin.',
  'cart.subtotal': 'Ara Toplam',
  'cart.total': 'Toplam',
  'cart.shipping': 'Kargo',
  'cart.discount': 'İndirim',
  'cart.free': 'Ücretsiz',
  'cart.coupon_code': 'Kupon Kodu',
  'cart.quantity': 'Adet',
  // Sipariş / durum
  'order.my_orders': 'Siparişlerim',
  'order.confirm': 'Siparişi Onayla',
  // Hesap
  'account.profile': 'Profil',
  'account.addresses': 'Adreslerim',
  'account.wishlist': 'Favorilerim',
  'account.logout': 'Çıkış Yap',
  'account.login': 'Giriş Yap',
}

const en: Dict = {
  'common.add_to_cart': 'Add to Cart',
  'common.buy_now': 'Buy Now',
  'common.checkout': 'Checkout',
  'common.continue_shopping': 'Continue Shopping',
  'common.start_shopping': 'Start Shopping',
  'common.view_all': 'View All',
  'common.apply': 'Apply',
  'common.remove': 'Remove',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.loading': 'Loading...',
  'common.search': 'Search',
  'common.language': 'Language',
  'common.currency': 'Currency',
  'common.price_from': 'from {price}',
  'cart.title': 'My Cart',
  'cart.empty': 'Your cart is empty',
  'cart.empty_desc': 'Add products to your cart to check out.',
  'cart.subtotal': 'Subtotal',
  'cart.total': 'Total',
  'cart.shipping': 'Shipping',
  'cart.discount': 'Discount',
  'cart.free': 'Free',
  'cart.coupon_code': 'Coupon Code',
  'cart.quantity': 'Qty',
  'order.my_orders': 'My Orders',
  'order.confirm': 'Place Order',
  'account.profile': 'Profile',
  'account.addresses': 'My Addresses',
  'account.wishlist': 'Wishlist',
  'account.logout': 'Log Out',
  'account.login': 'Log In',
}

export const messages: Record<Locale, Dict> = { tr, en }
