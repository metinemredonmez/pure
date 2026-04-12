import { Divider } from '@/components/Divider'
import Footer from '@/components/Footer'
import Header2 from '@/components/Header/Header2'
import AsideProductQuickView from '@/components/aside-product-quickview'
import AsideSidebarCart from '@/components/aside-sidebar-cart'
import AsideSidebarNavigation from '@/components/aside-sidebar-navigation'
import React, { FC } from 'react'
import AccountHeader from './AccountHeader'
import PageTab from './PageTab'

interface Props {
  children?: React.ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <Header2 />
      <div className="container">
        <div className="mt-14 sm:mt-20">
          <div className="mx-auto max-w-4xl">
            <AccountHeader />

            <Divider className="mt-10" />
            <PageTab />
            <Divider />
          </div>
        </div>
        <div className="mx-auto max-w-4xl pt-14 pb-24 sm:pt-16 lg:pb-32">{children}</div>
      </div>
      <Footer />

      {/* ASIDES */}
      <AsideSidebarNavigation />
      <AsideSidebarCart />
      <AsideProductQuickView />
    </>
  )
}

export default Layout
