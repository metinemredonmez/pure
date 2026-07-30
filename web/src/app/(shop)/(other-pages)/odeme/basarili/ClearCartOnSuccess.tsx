'use client'

import { useCart } from '@/contexts/CartContext'
import { useEffect } from 'react'

/**
 * Sepet YALNIZCA burada (ödeme başarıyla tamamlanıp PayTR bu sayfaya
 * yönlendirdiğinde) temizlenir. Checkout akışında sipariş oluşturulurken
 * sepet temizlenmez; böylece müşteri ödeme yapmadan/iptalle dönerse
 * ürünleri sepette kalır.
 */
export default function ClearCartOnSuccess() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return null
}
