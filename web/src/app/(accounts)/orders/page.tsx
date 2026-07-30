'use client'

import Prices from '@/components/Prices'
import { Button } from '@/shared/Button/Button'
import { PackageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Ödeme Bekleniyor', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Ödeme Alındı', color: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Onaylandı', color: 'bg-sky-100 text-sky-800' },
  PROCESSING: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Kargoya Verildi', color: 'bg-purple-100 text-purple-800' },
  IN_TRANSIT: { label: 'Yolda', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
  RETURNED: { label: 'İade Edildi', color: 'bg-neutral-100 text-neutral-800' },
  REFUNDED: { label: 'İade Edildi', color: 'bg-neutral-100 text-neutral-800' },
  PAYMENT_FAILED: { label: 'Ödeme Başarısız', color: 'bg-red-100 text-red-800' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pureolentia_token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        // Paginated response: { data: { data: [...], meta: {...} } }
        const payload = res?.data || res || {}
        const items = payload?.data || payload?.items || (Array.isArray(payload) ? payload : [])
        if (Array.isArray(items)) setOrders(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-neutral-400">Yükleniyor...</div>
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold">Sipariş Geçmişi</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          Son siparişlerinizin durumunu kontrol edin ve iade işlemlerini yönetin.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <HugeiconsIcon icon={PackageIcon} size={36} color="currentColor" strokeWidth={1.5} className="text-neutral-400" />
          </div>
          <h3 className="mt-6 text-lg font-semibold">Henüz siparişiniz yok</h3>
          <p className="mt-2 text-sm text-neutral-500">İlk siparişinizi verin!</p>
          <Link href="/collections/all" className="mt-6 rounded-full bg-primary-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-800">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        orders.map((order: any) => {
          const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-neutral-100 text-neutral-800' }
          const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

          return (
            <div key={order.id} className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:bg-neutral-500/5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">#{order.orderNumber}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">{date}</p>
                </div>
                <div className="mt-3 flex items-center gap-3 sm:mt-0">
                  <span className="text-lg font-bold text-primary-700">₺{Number(order.total || 0).toLocaleString('tr-TR')}</span>
                  <Button color="light" size="smaller" href={`/orders/${order.id}`}>
                    Detay
                  </Button>
                </div>
              </div>
              {order.items?.length > 0 && (
                <div className="divide-y border-t border-neutral-200 p-4 sm:p-6 dark:divide-neutral-700 dark:border-neutral-700">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex py-4 first:pt-0 last:pb-0">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {item.image && (
                          <Image fill sizes="80px" src={item.image} alt={item.productName || ''} className="object-cover" />
                        )}
                      </div>
                      <div className="ml-4 flex flex-1 flex-col justify-between">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium">{item.productName}</h3>
                          <span className="text-sm font-semibold">₺{Number(item.unitPrice || 0).toLocaleString('tr-TR')}</span>
                        </div>
                        <p className="text-xs text-neutral-500">Adet: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
