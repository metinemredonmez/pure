import Logo from '@/components/Logo'
import { getCurrencies, getNavigation } from '@/data/navigation'
import clsx from 'clsx'
import Link from 'next/link'
import { FC } from 'react'
import AvatarDropdown from './AvatarDropdown'
import CartBtn from './CartBtn'
import CurrencyDropdown from './CurrencyDropdown'
import HamburgerBtnMenu from './HamburgerBtnMenu'
import SearchBtnPopover from './SearchBtnPopover'

export interface HeaderProps {
  hasBorderBottom?: boolean
}

const Header: FC<HeaderProps> = async ({ hasBorderBottom = true }) => {
  const navigation = await getNavigation()
  const currencies = await getCurrencies()

  return (
    <div className="relative z-10">
      <div className="container">
        <div
          className={clsx(
            'flex h-20 justify-between gap-x-2.5 border-neutral-200 dark:border-neutral-700',
            hasBorderBottom && 'border-b',
          )}
        >
          <div className="flex items-center justify-center gap-x-3 sm:gap-x-6">
            <Logo />
            <div className="hidden h-9 border-l border-neutral-200 md:block dark:border-neutral-700"></div>

            {/* Direct nav links - no dropdowns */}
            <nav className="hidden items-center gap-x-5 lg:flex">
              {navigation.map((item) => (
                <Link
                  key={item.id}
                  href={item.href || '/'}
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-x-2.5 sm:gap-x-5">
            <div className="block lg:hidden">
              <HamburgerBtnMenu />
            </div>
            <CurrencyDropdown currencies={currencies} className="hidden md:block" />
            <SearchBtnPopover />
            <AvatarDropdown />
            <CartBtn />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
