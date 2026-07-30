'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Textarea } from '@/shared/textarea'
import { useRef, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function ContactForm() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const formData = new FormData(e.currentTarget)
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim() || undefined,
      subject: String(formData.get('subject') || '').trim() || undefined,
      message: String(formData.get('message') || '').trim(),
    }

    if (!payload.name || !payload.email || !payload.message) {
      setStatus('error')
      setErrorMsg(t('contact.error_required', 'Lütfen ad, e-posta ve mesaj alanlarını doldurun.'))
      return
    }

    try {
      const res = await fetch(`${API_URL}/public/contact-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let serverMsg = ''
        try {
          const errBody = await res.json()
          serverMsg = errBody?.message || errBody?.data?.message || ''
        } catch {}
        setStatus('error')
        setErrorMsg(
          serverMsg ||
            t('contact.error_send', 'Mesaj gönderilemedi (kod {code}). Lütfen daha sonra tekrar deneyin.', {
              code: res.status,
            })
        )
        return
      }

      // HTTP 2xx → treat as success regardless of body envelope shape
      setStatus('success')
      formRef.current?.reset()
    } catch (err) {
      setStatus('error')
      setErrorMsg(
        t(
          'contact.error_network',
          'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin veya birkaç dakika sonra tekrar deneyin.'
        )
      )
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup>
          <Field>
            <Label>{t('form.full_name', 'Ad Soyad')}</Label>
            <Input name="name" placeholder={t('form.full_name_placeholder', 'Adınız Soyadınız')} type="text" required />
          </Field>
          <Field>
            <Label>{t('form.email', 'E-posta')}</Label>
            <Input name="email" type="email" placeholder={t('form.email_placeholder', 'ornek@email.com')} required />
          </Field>
          <Field>
            <Label>{t('contact.phone_optional', 'Telefon (opsiyonel)')}</Label>
            <Input name="phone" type="tel" placeholder="+90 5xx xxx xx xx" />
          </Field>
          <Field>
            <Label>{t('contact.subject_optional', 'Konu (opsiyonel)')}</Label>
            <Input name="subject" type="text" placeholder={t('contact.subject_placeholder', 'Toplu sipariş, abonelik vb.')} />
          </Field>
          <Field>
            <Label>{t('contact.message', 'Mesajınız')}</Label>
            <Textarea name="message" rows={6} required placeholder={t('contact.message_placeholder', 'Mesajınızı yazın...')} />
          </Field>

          {status === 'success' && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {t('contact.success', 'Mesajınız başarıyla iletildi. En kısa sürede size dönüş yapacağız.')}
            </div>
          )}
          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <ButtonPrimary type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? t('form.sending', 'Gönderiliyor...') : t('contact.submit', 'Mesaj Gönder')}
          </ButtonPrimary>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
