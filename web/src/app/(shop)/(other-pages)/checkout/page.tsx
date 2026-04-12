import { Metadata } from 'next'
import CheckoutContent from './CheckoutContent'

export const metadata: Metadata = {
  title: 'Ödeme',
  description: 'Sipariş tamamlama',
}

export default function CheckoutPage() {
  return <CheckoutContent />
}
