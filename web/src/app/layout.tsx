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
                allowLocalhostAsSecureOrigin: true,
                notifyButton: {
                  enable: true,
                  size: 'medium',
                  theme: 'default',
                  position: 'bottom-left',
                  offset: { bottom: '20px', left: '20px', right: '0', top: '0' },
                  prenotify: true,
                  showCredit: false,
                  text: {
                    'tip.state.unsubscribed': 'Bildirimlere abone ol',
                    'tip.state.subscribed': 'Bildirimlere abonesiniz',
                    'tip.state.blocked': 'Bildirimleri engellediniz',
                    'message.prenotify': 'Yeni kahvelerden haberdar olmak için tıklayın',
                    'message.action.subscribed': 'Teşekkürler, artık abonesiniz!',
                    'message.action.resubscribed': 'Yeniden abonesiniz',
                    'message.action.unsubscribed': 'Artık bildirim almayacaksınız',
                    'dialog.main.title': 'Site Bildirimleri',
                    'dialog.main.button.subscribe': 'ABONE OL',
                    'dialog.main.button.unsubscribe': 'ABONELİKTEN ÇIK',
                    'dialog.blocked.title': 'Bildirimler Engellendi',
                    'dialog.blocked.message': 'Tarayıcı ayarlarından bildirimlere izin vermelisiniz.',
                  },
                  colors: {
                    'circle.background': '#3D2817',
                    'circle.foreground': '#ffffff',
                    'badge.background': '#C28A52',
                    'badge.foreground': '#ffffff',
                    'badge.bordercolor': '#ffffff',
                    'pulse.color': '#C28A52',
                    'dialog.button.background.hovering': '#5A3A1E',
                    'dialog.button.background.active': '#3D2817',
                    'dialog.button.background': '#4A2F1A',
                    'dialog.button.foreground': '#ffffff',
                  },
                },
                promptOptions: {
                  slidedown: {
                    prompts: [
                      {
                        type: 'push',
                        autoPrompt: true,
                        text: {
                          actionMessage:
                            'Yeni kahvelerden, özel indirimlerden ve kampanyalardan ilk siz haberdar olun.',
                          acceptButton: 'İzin Ver',
                          cancelButton: 'Belki Sonra',
                        },
                        delay: {
                          pageViews: 1,
                          timeDelay: 12,
                        },
                      },
                    ],
                  },
                },
              });
            });
          `}
        </Script>
      </body>
    </html>
  )
}
