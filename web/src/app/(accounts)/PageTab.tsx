'use client'

import { Link } from '@/components/Link'
import { useTranslation } from '@/contexts/LanguageContext'
import { usePathname } from 'next/navigation'

const pages: {
  name: string
  link: string
  tk: string
}[] = [
  {
    name: 'Hesap Bilgileri',
    link: '/account',
    tk: 'account.info_title',
  },
  {
    name: 'Favorilerim',
    link: '/account-wishlists',
    tk: 'wishlist.title',
  },
  {
    name: 'Aboneliklerim',
    link: '/account-subscriptions',
    tk: 'subscription.my_title',
  },
  {
    name: 'Sipariş Geçmişi',
    link: '/orders',
    tk: 'nav.order_history',
  },
  {
    name: 'Şifre Değiştir',
    link: '/account-password',
    tk: 'password.title',
  },
]

const PageTab = () => {
  const { t } = useTranslation()
  const pathname = usePathname()

  return (
    <div>
      <div className="hidden-scrollbar flex gap-x-8 overflow-x-auto md:gap-x-14">
        {pages.map((item) => {
          let isActive = pathname === item.link
          if (item.link === '/orders' && pathname.includes('/orders/')) {
            isActive = true
          }

          return (
            <Link
              key={item.link}
              href={item.link}
              className={`block shrink-0 border-b-2 py-5 text-sm sm:text-base md:py-8 ${
                isActive
                  ? 'border-primary-500 font-medium text-neutral-950 dark:text-neutral-100'
                  : 'border-transparent text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100'
              }`}
            >
              {t(item.tk, item.name)}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default PageTab
