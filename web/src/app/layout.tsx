import Aside from '@/components/aside'
import ChatbotWidget from '@/components/ChatbotWidget'
import { CartProvider } from '@/contexts/CartContext'
import '@/styles/tailwind.css'
import { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import GlobalClient from './GlobalClient'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    template: '%s - Pure Olentia',
    default: 'Pure Olentia | Premium Specialty Coffee',
  },
  description:
    'Pure Olentia - Tarladan fincana, izlenebilir ve sürdürülebilir özel kahve deneyimi. Premium specialty coffee from farm to cup.',
  keywords: ['Specialty Coffee', 'Kahve', 'Olentia', 'Pure', 'Farm to Cup', 'Sürdürülebilir', 'Premium'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable} ${inter.className}`}>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200">
        <CartProvider>
          <Aside.Provider>
            {children}
            <GlobalClient />
            <ChatbotWidget />
          </Aside.Provider>
        </CartProvider>
      </body>
    </html>
  )
}
