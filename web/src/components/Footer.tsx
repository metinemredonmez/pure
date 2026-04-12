import Logo from '@/components/Logo'
import { CustomLink } from '@/data/types'
import { getSiteSettings } from '@/lib/site-settings'
import SocialsList1 from '@/shared/SocialsList1/SocialsList1'
import React from 'react'

interface WidgetFooterMenu {
  id: string
  title: string
  menus: CustomLink[]
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: '2',
    title: 'Keşfet',
    menus: [
      { href: '/about', label: 'Hakkımızda' },
      { href: '/blog', label: 'Blog' },
      { href: '/demleme-rehberi', label: 'Demleme Rehberi' },
      { href: '/kahve-sozlugu', label: 'Kahve Sözlüğü' },
      { href: '/ekipmanlar', label: 'Ekipmanlar' },
    ],
  },
  {
    id: '3',
    title: 'Kurumsal',
    menus: [
      { href: '/b2b', label: 'Kurumsal Satış' },
      { href: '/toptan-satis', label: 'Toptan Satış' },
      { href: '/kurumsal-hediye', label: 'Kurumsal Hediye' },
      { href: '/franchise', label: 'Franchise' },
      { href: '/subscription', label: 'Abonelik' },
    ],
  },
  {
    id: '4',
    title: 'Destek',
    menus: [
      { href: '/siparis-takibi', label: 'Sipariş Takibi' },
      { href: '/iade-degisim', label: 'İade & Değişim' },
      { href: '/odeme-teslimat', label: 'Ödeme & Teslimat' },
      { href: '/sss', label: 'SSS' },
      { href: '/contact', label: 'İletişim' },
    ],
  },
  {
    id: '5',
    title: 'Yasal',
    menus: [
      { href: '/gizlilik-politikasi', label: 'Gizlilik Politikası' },
      { href: '/kvkk', label: 'KVKK' },
      { href: '/mesafeli-satis', label: 'Mesafeli Satış' },
      { href: '/kullanim-kosullari', label: 'Kullanım Koşulları' },
      { href: '/cerez-politikasi', label: 'Çerez Politikası' },
    ],
  },
]

const Footer: React.FC = async () => {
  const settings = await getSiteSettings()

  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">{menu.title}</h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, idx) => (
            <li key={idx}>
              <a
                className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <footer className="relative border-t border-neutral-200 dark:border-neutral-700">
      {/* Main footer */}
      <div className="py-16 lg:pt-24 lg:pb-20">
        <div className="container grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
          <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:flex lg:flex-col lg:md:col-span-1">
            <div className="col-span-2 md:col-span-1">
              <Logo />
            </div>
            <div className="col-span-2 flex items-center md:col-span-3">
              <SocialsList1 />
            </div>
          </div>
          {widgetMenus.map(renderWidgetMenuItem)}
        </div>

        {/* Contact info row */}
        {(settings.address || settings.phone || settings.email) && (
          <div className="container mt-12 grid grid-cols-1 gap-6 border-t border-neutral-200 pt-8 text-sm text-neutral-600 sm:grid-cols-3 dark:border-neutral-700 dark:text-neutral-400">
            {settings.address && (
              <div>
                <p className="mb-1 font-semibold text-neutral-800 dark:text-neutral-200">Adres</p>
                <p>{settings.address}</p>
              </div>
            )}
            {settings.phone && (
              <div>
                <p className="mb-1 font-semibold text-neutral-800 dark:text-neutral-200">Telefon</p>
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-primary-600">
                  {settings.phone}
                </a>
                {settings.workingHours && (
                  <p className="mt-1 text-xs text-neutral-500">{settings.workingHours}</p>
                )}
              </div>
            )}
            {settings.email && (
              <div>
                <p className="mb-1 font-semibold text-neutral-800 dark:text-neutral-200">E-posta</p>
                <a href={`mailto:${settings.email}`} className="hover:text-primary-600">
                  {settings.email}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trust badges + copyright */}
      <div className="border-t border-neutral-200 dark:border-neutral-700">
        <div className="container flex flex-col items-center gap-y-4 py-6 sm:flex-row sm:justify-between">
          {/* Payment icons */}
          <div className="flex items-center gap-x-3">
            <span className="text-xs text-neutral-400">Odeme yontemleri:</span>
            <div className="flex items-center gap-x-2">
              {/* Visa */}
              <div className="flex h-7 w-11 items-center justify-center rounded border border-neutral-200 bg-white text-[10px] font-bold text-blue-700 dark:border-neutral-600 dark:bg-neutral-800">
                VISA
              </div>
              {/* Mastercard */}
              <div className="flex h-7 w-11 items-center justify-center rounded border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800">
                <div className="flex -space-x-1">
                  <div className="h-3.5 w-3.5 rounded-full bg-red-500 opacity-80"></div>
                  <div className="h-3.5 w-3.5 rounded-full bg-yellow-500 opacity-80"></div>
                </div>
              </div>
              {/* Troy */}
              <div className="flex h-7 w-11 items-center justify-center rounded border border-neutral-200 bg-white text-[8px] font-bold text-green-700 dark:border-neutral-600 dark:bg-neutral-800">
                TROY
              </div>
              {/* SSL */}
              <div className="flex h-7 items-center gap-x-1 rounded border border-neutral-200 bg-white px-1.5 text-[8px] font-semibold text-green-600 dark:border-neutral-600 dark:bg-neutral-800">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                SSL
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} {settings.siteName || 'Pure Olentia'}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
