'use client'

import { Divider } from '@/components/Divider'
import { useTranslation } from '@/contexts/LanguageContext'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const STATUS_MAP: Record<string, { label: string; color: string; step: number }> = {
  PENDING: { label: 'Ödeme Bekleniyor', color: 'bg-yellow-100 text-yellow-800', step: 0 },
  PAID: { label: 'Ödeme Alındı', color: 'bg-amber-100 text-amber-800', step: 1 },
  CONFIRMED: { label: 'Onaylandı', color: 'bg-sky-100 text-sky-800', step: 1 },
  PREPARING: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800', step: 2 },
  PROCESSING: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800', step: 2 },
  SHIPPED: { label: 'Kargoya Verildi', color: 'bg-purple-100 text-purple-800', step: 3 },
  IN_TRANSIT: { label: 'Yolda', color: 'bg-purple-100 text-purple-800', step: 3 },
  DELIVERED: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', step: 4 },
  CANCELLED: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', step: 0 },
  RETURNED: { label: 'İade Edildi', color: 'bg-neutral-100 text-neutral-800', step: 0 },
  REFUNDED: { label: 'İade Edildi', color: 'bg-neutral-100 text-neutral-800', step: 0 },
  PAYMENT_FAILED: { label: 'Ödeme Başarısız', color: 'bg-red-100 text-red-800', step: 0 },
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CREDIT_CARD: 'Kredi / Banka Kartı',
  DEBIT_CARD: 'Banka Kartı',
  BANK_TRANSFER: 'Havale / EFT',
  QR_CODE: 'QR Kod',
}

function money(v: any) {
  return `₺${Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtDate(d?: string) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return '—'
  }
}

export default function OrderDetailPage() {
  const { t } = useTranslation()
  const params = useParams<{ number: string }>()
  const id = params?.number
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('pureolentia_token')
    if (!token) {
      window.location.href = '/login?redirect=/orders'
      return
    }
    if (!id) return
    fetch(`${API_URL}/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((res) => {
        const data = res?.data || res
        if (!data || !data.id) {
          setError(t('order.not_found', 'Sipariş bulunamadı.'))
        } else {
          setOrder(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setError(t('order.load_failed', 'Sipariş yüklenemedi.'))
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="py-20 text-center text-neutral-400">{t('common.loading', 'Yükleniyor...')}</div>
  if (error || !order) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold">{error || t('order.not_found_short', 'Sipariş bulunamadı')}</h1>
        <Link href="/orders" className="mt-4 inline-block text-sm font-medium text-primary-700 underline">
          {t('order.back_to_orders', 'Siparişlerime dön')}
        </Link>
      </div>
    )
  }

  const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-neutral-100 text-neutral-800', step: 0 }
  const addr = order.address
  const items: any[] = order.items || []

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-1 text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">{t('order.placed_on', 'Sipariş verildi')}</span>
            <time> {fmtDate(order.createdAt)}</time>
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('order.order_number', 'Sipariş #{number}', { number: order.orderNumber })}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
          </div>
        </div>
        {order.invoiceUrl && (
          <div className="ml-auto">
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-600"
            >
              {t('order.view_invoice', 'Faturayı Görüntüle')} <span className="ms-2">&rarr;</span>
            </a>
          </div>
        )}
      </div>

      {/* Durum çubuğu */}
      <div className="mt-8 rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
        <div className="overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            style={{ width: `calc(${status.step} / 4 * 100%)` }}
            className="h-2 rounded-full bg-primary-700"
          />
        </div>
        <div className="mt-4 hidden grid-cols-4 text-sm font-medium text-neutral-500 sm:grid">
          <div className={status.step >= 1 ? 'text-neutral-950 dark:text-white' : ''}>{t('order.step_paid', 'Ödeme Alındı')}</div>
          <div className={`text-center ${status.step >= 2 ? 'text-neutral-950 dark:text-white' : ''}`}>{t('order.step_preparing', 'Hazırlanıyor')}</div>
          <div className={`text-center ${status.step >= 3 ? 'text-neutral-950 dark:text-white' : ''}`}>{t('order.step_shipping', 'Kargoda')}</div>
          <div className={`text-right ${status.step >= 4 ? 'text-neutral-950 dark:text-white' : ''}`}>{t('order.step_delivered', 'Teslim Edildi')}</div>
        </div>
        {order.trackingNumber && (
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
            {t('order.tracking_no', 'Kargo Takip No:')} <span className="font-medium">{order.trackingNumber}</span>
            {order.trackingUrl && (
              <>
                {' — '}
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary-700 underline">
                  {t('order.track_cargo', 'kargoyu takip et')}
                </a>
              </>
            )}
          </p>
        )}
      </div>

      {/* Ürünler */}
      <div className="mt-8 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="divide-y divide-neutral-200 p-4 sm:p-6 dark:divide-neutral-700">
          {items.map((item, idx) => (
            <div key={idx} className="flex py-4 first:pt-0 last:pb-0">
              <div className="flex-1">
                <h3 className="text-sm font-medium">{item.productName || item.product?.name || t('order.product', 'Ürün')}</h3>
                {(item.variantName || item.variant?.name) && (
                  <p className="mt-0.5 text-xs text-primary-700">{item.variantName || item.variant?.name}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">{t('order.quantity', 'Adet: {count}', { count: item.quantity })}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{money(item.totalPrice)}</p>
                <p className="text-xs text-neutral-500">{t('order.per_unit', '{price} / adet', { price: money(item.unitPrice) })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adres + Ödeme + Özet */}
      <div className="mt-8 rounded-lg bg-neutral-50 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-8 dark:bg-neutral-800">
        <dl className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 lg:col-span-7">
          <div>
            <dt className="font-medium">{t('order.address_title', 'Teslimat / Fatura Adresi')}</dt>
            <dd className="mt-3 text-neutral-500 dark:text-neutral-400">
              {addr ? (
                <>
                  <span className="block">{[addr.firstName, addr.lastName].filter(Boolean).join(' ')}</span>
                  <span className="block">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</span>
                  <span className="block">{[addr.district, addr.city, addr.postalCode].filter(Boolean).join(' / ')}</span>
                  {addr.phone && <span className="block">{addr.phone}</span>}
                </>
              ) : (
                <span className="block">{t('order.no_address', 'Adres bilgisi yok')}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium">{t('order.payment_info', 'Ödeme Bilgisi')}</dt>
            <dd className="mt-3 text-neutral-500 dark:text-neutral-400">
              <span className="block">
                {PAYMENT_METHOD_LABEL[order.payment?.method] || order.payment?.method || t('order.credit_debit_card', 'Kredi / Banka Kartı')}
              </span>
              <span className="block">
                {t('order.payment_status', 'Durum:')} {order.payment?.status === 'COMPLETED' ? t('order.payment_paid', 'Ödendi') : order.payment?.status === 'REFUNDED' ? t('order.payment_refunded', 'İade Edildi') : order.payment?.status || status.label}
              </span>
            </dd>
          </div>
        </dl>

        <dl className="mt-8 flex flex-col gap-y-4 text-sm lg:col-span-5 lg:mt-0">
          <div className="flex items-center justify-between">
            <dt className="text-neutral-600 dark:text-neutral-300">{t('cart.subtotal', 'Ara Toplam')}</dt>
            <dd className="font-medium">{money(order.subtotal)}</dd>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex items-center justify-between text-green-700 dark:text-green-400">
              <dt>{t('cart.discount', 'İndirim')}</dt>
              <dd className="font-medium">-{money(order.discount)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-neutral-600 dark:text-neutral-300">{t('cart.shipping', 'Kargo')}</dt>
            <dd className="font-medium">{Number(order.shippingCost) === 0 ? t('cart.free', 'Ücretsiz') : money(order.shippingCost)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-neutral-600 dark:text-neutral-300">{t('order.tax_included', 'KDV (dahil)')}</dt>
            <dd className="font-medium">{money(order.tax)}</dd>
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <dt className="font-medium">{t('cart.total', 'Toplam')}</dt>
            <dd className="font-semibold text-primary-700">{money(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8">
        <Link href="/orders" className="text-sm font-medium text-primary-700 underline">
          {t('order.back_to_orders_arrow', '← Siparişlerime dön')}
        </Link>
      </div>
    </div>
  )
}
