'use client'

import { Suspense, lazy } from 'react'

const CheckoutContent = lazy(() => import('./CheckoutContent'))

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center text-neutral-400">Yükleniyor...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
