'use client'

import { Suspense, lazy } from 'react'

const CartPageContent = lazy(() => import('./CartPageContent'))

export default function CartPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center text-neutral-400">Yükleniyor...</div>}>
      <CartPageContent />
    </Suspense>
  )
}
