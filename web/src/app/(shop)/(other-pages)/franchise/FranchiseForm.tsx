'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Textarea } from '@/shared/textarea'
import { useRef, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function FranchiseForm() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    const payload = {
      fullName: String(fd.get('fullName') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      city: String(fd.get('city') || '').trim(),
      locationType: String(fd.get('locationType') || 'cadde'),
      budget: String(fd.get('budget') || '500000-1000000'),
      hasExperience: String(fd.get('experience') || '').trim().length > 0,
      experienceDetail: String(fd.get('experience') || '').trim() || undefined,
      plannedOpenDate: String(fd.get('plannedOpenDate') || 'hemen'),
      notes: String(fd.get('notes') || '').trim() || undefined,
    }

    if (!payload.fullName || !payload.phone || !payload.email || !payload.city) {
      setStatus('error')
      setErrorMsg(t('franchise.error_required', 'Lütfen ad soyad, telefon, e-posta ve şehir alanlarını doldurun.'))
      return
    }

    try {
      const res = await fetch(`${API_URL}/public/franchise-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let serverMsg = ''
        try {
          const errBody = await res.json()
          serverMsg =
            errBody?.message ||
            errBody?.data?.message ||
            (Array.isArray(errBody?.errors) ? errBody.errors.join(', ') : '')
        } catch {}
        setStatus('error')
        setErrorMsg(serverMsg || t('franchise.error_send', 'Başvuru gönderilemedi (kod {code}).', { code: res.status }))
        return
      }

      setStatus('success')
      formRef.current?.reset()
    } catch {
      setStatus('error')
      setErrorMsg(t('form.error_network', 'Sunucuya ulaşılamadı. Lütfen birkaç dakika sonra tekrar deneyin.'))
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-10">
      <Fieldset>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label>{t('form.full_name', 'Ad Soyad')}</Label>
              <Input name="fullName" required />
            </Field>
            <Field>
              <Label>{t('form.phone', 'Telefon')}</Label>
              <Input name="phone" type="tel" placeholder="+90 5XX XXX XX XX" required />
            </Field>
          </div>
          <Field>
            <Label>{t('form.email', 'E-posta')}</Label>
            <Input name="email" type="email" placeholder={t('form.email_placeholder', 'ornek@email.com')} required />
          </Field>
          <Field>
            <Label>{t('franchise.city', 'Şehir')}</Label>
            <Input name="city" placeholder={t('franchise.city_placeholder', 'Hangi şehirde açmayı düşünüyorsunuz?')} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label>{t('franchise.location_type', 'Lokasyon Tipi')}</Label>
              <select
                name="locationType"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                defaultValue="cadde"
              >
                <option value="cadde">{t('franchise.location_street', 'Cadde üzeri')}</option>
                <option value="avm">{t('franchise.location_mall', 'AVM')}</option>
                <option value="ofis">{t('franchise.location_office', 'Ofis bölgesi')}</option>
                <option value="diger">{t('franchise.location_other', 'Diğer')}</option>
              </select>
            </Field>
            <Field>
              <Label>{t('franchise.planned_open', 'Planlanan Açılış')}</Label>
              <select
                name="plannedOpenDate"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                defaultValue="hemen"
              >
                <option value="hemen">{t('franchise.open_now', 'Hemen')}</option>
                <option value="1-3-ay">{t('franchise.open_1_3', '1-3 ay')}</option>
                <option value="3-6-ay">{t('franchise.open_3_6', '3-6 ay')}</option>
                <option value="6-ay-sonrasi">{t('franchise.open_6_plus', '6 ay sonrası')}</option>
              </select>
            </Field>
          </div>
          <Field>
            <Label>{t('franchise.budget', 'Yatırım Bütçesi')}</Label>
            <select
              name="budget"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              defaultValue="500000-1000000"
            >
              <option value="500000-alti">{t('franchise.budget_under_500k', '500.000 TL altı')}</option>
              <option value="500000-1000000">500.000 - 1.000.000 TL</option>
              <option value="1000000-2000000">1.000.000 - 2.000.000 TL</option>
              <option value="2000000-uzeri">{t('franchise.budget_over_2m', '2.000.000 TL ve üzeri')}</option>
            </select>
          </Field>
          <Field>
            <Label>{t('franchise.experience', 'İş Deneyiminiz (opsiyonel)')}</Label>
            <Textarea name="experience" rows={3} placeholder={t('franchise.experience_placeholder', 'Daha önce işletme tecrübeniz var mı?')} />
          </Field>
          <Field>
            <Label>{t('franchise.notes', 'Ek Notlar (opsiyonel)')}</Label>
            <Textarea name="notes" rows={3} placeholder={t('franchise.notes_placeholder', 'Eklemek istediğiniz notlar...')} />
          </Field>

          {status === 'success' && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {t('franchise.success', 'Başvurunuz başarıyla alındı. Ekibimiz 3 iş günü içinde size dönüş yapacak.')}
            </div>
          )}
          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <ButtonPrimary type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? t('form.sending', 'Gönderiliyor...') : t('franchise.submit', 'Başvurumu Gönder')}
          </ButtonPrimary>
          <p className="text-center text-xs text-neutral-400">
            {t('franchise.review_note', 'Başvurunuz 3 iş günü içinde değerlendirilecektir.')}
          </p>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
