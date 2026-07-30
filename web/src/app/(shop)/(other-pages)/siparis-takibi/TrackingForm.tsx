'use client'

import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:    { label: 'Ödeme Bekleniyor',  color: 'bg-amber-100 text-amber-800 border-amber-200',       icon: '⏳' },
  PAID:       { label: 'Ödeme Alındı',      color: 'bg-amber-100 text-amber-800 border-amber-200',       icon: '💳' },
  CONFIRMED:  { label: 'Onaylandı',        color: 'bg-sky-100 text-sky-800 border-sky-200',             icon: '✓' },
  PROCESSING: { label: 'Hazırlanıyor',     color: 'bg-indigo-100 text-indigo-800 border-indigo-200',    icon: '☕' },
  PREPARING:  { label: 'Hazırlanıyor',     color: 'bg-indigo-100 text-indigo-800 border-indigo-200',    icon: '☕' },
  SHIPPED:    { label: 'Kargoda',          color: 'bg-violet-100 text-violet-800 border-violet-200',    icon: '🚚' },
  IN_TRANSIT: { label: 'Yolda',            color: 'bg-violet-100 text-violet-800 border-violet-200',    icon: '📦' },
  DELIVERED:  { label: 'Teslim Edildi',    color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🎉' },
  CANCELLED:  { label: 'İptal Edildi',     color: 'bg-neutral-100 text-neutral-700 border-neutral-200', icon: '✕' },
  RETURNED:   { label: 'İade Edildi',      color: 'bg-red-100 text-red-700 border-red-200',             icon: '↩' },
  REFUNDED:   { label: 'Ücret İadesi',     color: 'bg-red-100 text-red-700 border-red-200',             icon: '₺' },
  FAILED:     { label: 'Başarısız',        color: 'bg-red-100 text-red-700 border-red-200',             icon: '!' },
}

function fmt(date?: string) {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleString('tr-TR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function money(v: any) {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v || 0)
  return `₺${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function TrackingForm() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    if (!orderNumber || !email) {
      setError('Sipariş numarası ve e-posta zorunludur.')
      return
    }
    setLoading(true)
    try {
      const url = new URL(`${API_URL}/orders/track`)
      url.searchParams.set('orderNumber', orderNumber.trim())
      url.searchParams.set('email', email.trim())
      const r = await fetch(url.toString())
      const j = await r.json()
      if (!r.ok || j?.success === false) {
        throw new Error(j?.message || 'Sipariş bulunamadı')
      }
      setResult(j?.data || j)
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const status = result?.status ? STATUS_LABELS[result.status] || { label: result.status, color: 'bg-neutral-100 text-neutral-700 border-neutral-200', icon: '•' } : null

  return (
    <>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Sipariş Numarası
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="OLN-2026-0000"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            E-posta Adresi
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary-700 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-800 disabled:opacity-60"
        >
          {loading ? 'Sorgulanıyor...' : 'Sipariş Durumunu Sorgula'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {result && status && (
        <div className="mt-6 space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-neutral-500">Sipariş No</p>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">{result.orderNumber}</p>
              <p className="mt-1 text-xs text-neutral-500">{fmt(result.createdAt)}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}>
              <span className="mr-1">{status.icon}</span> {status.label}
            </span>
          </div>

          {result.trackingNumber && (
            <div className="rounded-xl bg-white p-3 text-xs dark:bg-neutral-900">
              <span className="text-neutral-500">Kargo Takip No: </span>
              <span className="font-mono font-semibold">{result.trackingNumber}</span>
              {result.trackingUrl && (
                <a href={result.trackingUrl} target="_blank" rel="noreferrer" className="ml-2 text-primary-700 hover:underline">
                  Kargo sitesinde takip et →
                </a>
              )}
            </div>
          )}

          {Array.isArray(result.items) && result.items.length > 0 && (
            <div className="rounded-xl bg-white p-3 dark:bg-neutral-900">
              <p className="mb-2 text-xs font-semibold text-neutral-500">Ürünler</p>
              <ul className="space-y-1 text-xs">
                {result.items.map((it: any, i: number) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {it.product?.name || 'Ürün'} × {it.quantity}
                    </span>
                    <span className="font-semibold">{money(Number(it.unitPrice) * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t pt-2 text-sm font-bold dark:border-neutral-700">
                <span>Toplam</span>
                <span className="text-primary-700">{money(result.total)}</span>
              </div>
            </div>
          )}

          {Array.isArray(result.statusHistory) && result.statusHistory.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-neutral-500">Durum Geçmişi</p>
              <div className="space-y-2">
                {result.statusHistory.map((h: any, i: number) => {
                  const s = STATUS_LABELS[h.status] || { label: h.status, color: '', icon: '•' }
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5">{s.icon}</span>
                      <div>
                        <span className="font-semibold text-neutral-900 dark:text-white">{s.label}</span>
                        <span className="ml-2 text-neutral-500">{fmt(h.createdAt)}</span>
                        {h.note && <p className="text-neutral-500">{h.note}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
