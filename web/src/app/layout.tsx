import Aside from '@/components/aside'
import ChatbotWidget from '@/components/ChatbotWidget'
import { CartProvider } from '@/contexts/CartContext'
import '@/styles/tailwind.css'
import { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import GlobalClient from './GlobalClient'

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '5283e063-ecb8-4fba-8a70-d85c3b8faf8f'

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

        {/* OneSignal Web Push */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "${ONESIGNAL_APP_ID}",
                safari_web_id: undefined,
                notifyButton: { enable: false },
                allowLocalhostAsSecureOrigin: true,
              });
            });
          `}
        </Script>
      </body>
    </html>
  )
}
