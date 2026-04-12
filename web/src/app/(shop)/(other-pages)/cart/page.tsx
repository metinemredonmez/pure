import { Metadata } from 'next'
import CartPageContent from './CartPageContent'

export const metadata: Metadata = {
  title: 'Sepet',
  description: 'Alışveriş sepetiniz',
}

export default function CartPage() {
  return <CartPageContent />
}
