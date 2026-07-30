'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Textarea } from '@/shared/textarea'
import { useRef, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function B2BForm() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '').trim()
    const company = String(fd.get('company') || '').trim()
    const email = String(fd.get('email') || '').trim()
    const phone = String(fd.get('phone') || '').trim()
    const sector = String(fd.get('sector') || '').trim()
    const volume = String(fd.get('volume') || '').trim()
    const message = String(fd.get('message') || '').trim()

    if (!name || !company || !email) {
      setStatus('error')
      setErrorMsg(t('b2b.error_required', 'Lütfen ad, firma ve e-posta alanlarını doldurun.'))
      return
    }

    // B2B başvuruları artık doğru endpoint'e gidiyor: /b2b/leads
    // (eskiden /public/contact-message'a düşüyordu, contact_messages'a karışıyordu).
    // Sektör + mesaj notes alanında birleşik kayıt edilir; admin /admin/b2b'de görür.
    const notes = [
      sector && `Sektör: ${sector}`,
      message && `Mesaj: ${message}`,
    ]
      .filter(Boolean)
      .join('\n\n')

    try {
      const res = await fetch(`${API_URL}/b2b/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company,
          contactName: name,
          email,
          phone: phone || '-', // backend phone required; '-' if not provided
          monthlyConsumption: volume ? `${volume} kg/ay` : undefined,
          notes: notes || undefined,
        }),
      })

      if (!res.ok) {
        let serverMsg = ''
        try {
          const errBody = await res.json()
          serverMsg = errBody?.message || errBody?.data?.message || ''
        } catch {}
        setStatus('error')
        setErrorMsg(serverMsg || t('b2b.error_send', 'Teklif talebi gönderilemedi (kod {code}).', { code: res.status }))
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
              <Input name="name" placeholder={t('form.full_name_placeholder', 'Adınız Soyadınız')} required />
            </Field>
            <Field>
              <Label>{t('b2b.company', 'Firma Adı')}</Label>
              <Input name="company" placeholder={t('b2b.company_placeholder', 'Firma adı')} required />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label>{t('form.email', 'E-posta')}</Label>
              <Input name="email" type="email" placeholder={t('b2b.email_placeholder', 'ornek@firma.com')} required />
            </Field>
            <Field>
              <Label>{t('form.phone', 'Telefon')}</Label>
              <Input name="phone" placeholder="+90 5XX XXX XX XX" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label>{t('b2b.sector', 'Sektör')}</Label>
              <Input name="sector" placeholder={t('b2b.sector_placeholder', 'Otel, Restoran, Ofis...')} />
            </Field>
            <Field>
              <Label>{t('b2b.monthly_volume', 'Aylık Tüketim (kg)')}</Label>
              <Input name="volume" type="number" placeholder={t('b2b.volume_placeholder', 'Örneğin: 50')} />
            </Field>
          </div>
          <Field>
            <Label>{t('contact.message', 'Mesajınız')}</Label>
            <Textarea name="message" rows={4} placeholder={t('b2b.message_placeholder', 'İhtiyaçlarınızı anlatabilirsiniz...')} />
          </Field>

          {status === 'success' && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {t('b2b.success', 'Teklif talebiniz başarıyla iletildi. 24 saat içinde size dönüş yapacağız.')}
            </div>
          )}
          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <ButtonPrimary type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? t('form.sending', 'Gönderiliyor...') : t('b2b.submit', 'Teklif Talep Et')}
          </ButtonPrimary>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
