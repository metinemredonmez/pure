import Logo from '@/components/Logo'
import { CustomLink } from '@/data/types'
import SocialsList1 from '@/shared/SocialsList1/SocialsList1'
import React from 'react'

interface WidgetFooterMenu {
  id: string
  title: string
  menus: CustomLink[]
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: '1',
    title: 'Kahveler',
    menus: [
      { href: '/collections/single-origin', label: 'Single Origin' },
      { href: '/collections/blend', label: 'Blend' },
      { href: '/collections/espresso', label: 'Espresso' },
      { href: '/collections/filter', label: 'Filtre Kahve' },
    ],
  },
  {
    id: '2',
    title: 'Kesfet',
    menus: [
      { href: '/about', label: 'Hakkimizda' },
      { href: '/blog', label: 'Kahve Rehberi' },
      { href: '/subscription', label: 'Abonelik' },
      { href: '/collections/equipment', label: 'Ekipmanlar' },
    ],
  },
  {
    id: '3',
    title: 'Kurumsal',
    menus: [
      { href: '/b2b', label: 'Kurumsal Satis' },
      { href: '/franchise', label: 'Franchise' },
      { href: '/references', label: 'Referanslar' },
      { href: '/contact', label: 'Iletisim' },
    ],
  },
  {
    id: '4',
    title: 'Destek',
    menus: [
      { href: '/', label: 'Siparis Takibi' },
      { href: '/', label: 'Iade & Degisim' },
      { href: '/', label: 'SSS' },
      { href: '/', label: 'Gizlilik Politikasi' },
    ],
  },
]

const Footer: React.FC = () => {
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
            &copy; {new Date().getFullYear()} Pure Olentia. Tum haklari saklidir.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
