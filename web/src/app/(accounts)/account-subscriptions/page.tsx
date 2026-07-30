'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface SubscriptionItem {
  id: string
  status: string
  nextBillingDate?: string
  cancelledAt?: string | null
  pausedAt?: string | null
  cardLast4?: string | null
  cardBrand?: string | null
  grindPreference?: string | null
  createdAt: string
  plan?: {
    id: string
    name: string
    priceMonthly: number | string
    weightGrams?: number
    frequencyWeeks?: number
  }
  cycles?: { id: string; cycleNumber: number; billingDate: string; amount: number | string; status: string }[]
}

function formatPrice(v: any) {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v || 0)
  return `₺${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return '—'
  }
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Aktif', cls: 'bg-green-100 text-green-800' },
  PAUSED: { label: 'Duraklatıldı', cls: 'bg-amber-100 text-amber-800' },
  CANCELLED: { label: 'İptal Edildi', cls: 'bg-neutral-200 text-neutral-700' },
  PAST_DUE: { label: 'Ödeme Bekleniyor', cls: 'bg-orange-100 text-orange-800' },
  SUSPENDED: { label: 'Askıya Alındı', cls: 'bg-red-100 text-red-800' },
  EXPIRED: { label: 'Süresi Doldu', cls: 'bg-neutral-200 text-neutral-700' },
}

export default function AccountSubscriptionsPage() {
  const { t } = useTranslation()
  const [subs, setSubs] = useState<SubscriptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    const token = localStorage.getItem('pureolentia_token')
    if (!token) {
      window.location.href = '/login?redirect=/account-subscriptions'
      return
    }
    try {
      const r = await fetch(`${API_URL}/subscriptions`, { headers: { Authorization: `Bearer ${token}` } })
      const j = await r.json()
      const list = j?.data?.data || j?.data || j || []
      setSubs(Array.isArray(list) ? list : [])
    } catch {
      setSubs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const action = async (id: string, kind: 'pause' | 'resume' | 'cancel') => {
    const token = localStorage.getItem('pureolentia_token')
    if (!token) return
    const confirmMsg = kind === 'cancel' ? t('subscription.cancel_confirm', 'Aboneliği iptal etmek istediğinize emin misiniz?') : ''
    if (confirmMsg && !confirm(confirmMsg)) return
    setBusyId(id)
    try {
      const r = await fetch(`${API_URL}/subscriptions/${id}/${kind}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const j = await r.json()
      if (!r.ok || j?.success === false) throw new Error(j?.message || t('common.error', 'Hata'))
      toast.success(
        kind === 'pause' ? t('subscription.paused_toast', 'Abonelik duraklatıldı') : kind === 'resume' ? t('subscription.resumed_toast', 'Abonelik yeniden başlatıldı') : t('subscription.cancelled_toast', 'Abonelik iptal edildi')
      )
      await load()
    } catch (e: any) {
      toast.error(e?.message || t('common.action_failed', 'İşlem başarısız'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-neutral-500">{t('subscription.loading', 'Abonelikler yükleniyor...')}</div>
    )
  }

  if (subs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 p-12 text-center">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('subscription.empty_title', 'Henüz aboneliğiniz yok')}</h2>
        <p className="mt-2 text-sm text-neutral-500">{t('subscription.empty_desc', 'Kahve aboneliğine başlayın, her ay taze kavrulmuş kahveniz kapınıza gelsin.')}</p>
        <Link
          href="/subscription"
          className="mt-6 inline-flex items-center rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-800 transition"
        >
          {t('subscription.browse_plans', 'Abonelikleri İncele')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('subscription.my_title', 'Aboneliklerim')}</h1>
        <p className="mt-1 text-sm text-neutral-500">{t('subscription.my_subtitle', 'Aktif aboneliklerinizi buradan yönetebilirsiniz.')}</p>
      </div>

      {subs.map((s) => {
        const st = STATUS_MAP[s.status] || { label: s.status, cls: 'bg-neutral-100 text-neutral-700' }
        const isActive = s.status === 'ACTIVE'
        const isPaused = s.status === 'PAUSED'
        const canCancel = isActive || isPaused || s.status === 'PAST_DUE'

        return (
          <div key={s.id} className="rounded-3xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {s.plan?.name || t('subscription.default_name', 'Abonelik')}
                  </h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${st.cls}`}>{t(`subscription.status_${s.status.toLowerCase()}`, st.label)}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {t('subscription.start_label', 'Başlangıç:')} {formatDate(s.createdAt)}
                  {s.plan?.frequencyWeeks ? ` · ${s.plan.frequencyWeeks === 4 ? t('subscription.freq_monthly', 'Ayda 1') : t('subscription.freq_weeks', '{weeks} haftada 1', { weeks: s.plan.frequencyWeeks })}` : ''}
                  {s.plan?.weightGrams ? ` · ${s.plan.weightGrams >= 1000 ? `${s.plan.weightGrams / 1000}kg` : `${s.plan.weightGrams}g`}` : ''}
                </p>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-primary-700">{s.plan ? formatPrice(s.plan.priceMonthly) : '—'}</div>
                <div className="text-xs text-neutral-500">{t('subscription.per_delivery', '/ teslimat')}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-4 text-xs sm:grid-cols-4">
              <div>
                <div className="text-neutral-500">{t('subscription.next_delivery', 'Sonraki Teslimat')}</div>
                <div className="mt-1 font-semibold text-neutral-900 dark:text-white">{formatDate(s.nextBillingDate)}</div>
              </div>
              <div>
                <div className="text-neutral-500">{t('subscription.grind', 'Öğütüm')}</div>
                <div className="mt-1 font-semibold text-neutral-900 dark:text-white">{s.grindPreference || '—'}</div>
              </div>
              <div>
                <div className="text-neutral-500">{t('subscription.payment_card', 'Ödeme Kartı')}</div>
                <div className="mt-1 font-semibold text-neutral-900 dark:text-white">
                  {s.cardBrand && s.cardLast4 ? `${s.cardBrand} •••• ${s.cardLast4}` : '—'}
                </div>
              </div>
              <div>
                <div className="text-neutral-500">{t('subscription.delivery_count', 'Teslimat Sayısı')}</div>
                <div className="mt-1 font-semibold text-neutral-900 dark:text-white">{s.cycles?.length || 0}</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {isActive && (
                <button
                  onClick={() => action(s.id, 'pause')}
                  disabled={busyId === s.id}
                  className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
                >
                  {t('subscription.pause', 'Duraklat')}
                </button>
              )}
              {isPaused && (
                <button
                  onClick={() => action(s.id, 'resume')}
                  disabled={busyId === s.id}
                  className="rounded-full bg-primary-700 px-4 py-2 text-xs font-medium text-white hover:bg-primary-800 disabled:opacity-50"
                >
                  {t('subscription.resume', 'Devam Ettir')}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => action(s.id, 'cancel')}
                  disabled={busyId === s.id}
                  className="rounded-full border border-red-300 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {t('subscription.cancel', 'Aboneliği İptal Et')}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
