import { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Sepet',
  description: 'Alışveriş sepetiniz',
}

const CartPageContent = dynamic(() => import('./CartPageContent'), { ssr: false })

export default function CartPage() {
  return <CartPageContent />
}
