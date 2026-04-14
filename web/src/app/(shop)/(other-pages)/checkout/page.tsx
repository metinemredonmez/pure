import { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Ödeme',
  description: 'Sipariş tamamlama',
}

const CheckoutContent = dynamic(() => import('./CheckoutContent'), { ssr: false })

export default function CheckoutPage() {
  return <CheckoutContent />
}
