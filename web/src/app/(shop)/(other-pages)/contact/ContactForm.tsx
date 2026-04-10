'use client'

import { submitContactMessage } from '@/lib/api'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Textarea } from '@/shared/textarea'
import { useState } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

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
      setErrorMsg('Lütfen ad, e-posta ve mesaj alanlarını doldurun.')
      return
    }

    try {
      const res = await submitContactMessage(payload)
      if (res?.success) {
        setStatus('success')
        ;(e.currentTarget as HTMLFormElement).reset()
      } else {
        setStatus('error')
        setErrorMsg('Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup>
          <Field>
            <Label>Ad Soyad</Label>
            <Input name="name" placeholder="Adınız Soyadınız" type="text" required />
          </Field>
          <Field>
            <Label>E-posta</Label>
            <Input name="email" type="email" placeholder="ornek@email.com" required />
          </Field>
          <Field>
            <Label>Telefon (opsiyonel)</Label>
            <Input name="phone" type="tel" placeholder="+90 5xx xxx xx xx" />
          </Field>
          <Field>
            <Label>Konu (opsiyonel)</Label>
            <Input name="subject" type="text" placeholder="Toplu sipariş, abonelik vb." />
          </Field>
          <Field>
            <Label>Mesajınız</Label>
            <Textarea name="message" rows={6} required placeholder="Mesajınızı yazın..." />
          </Field>

          {status === 'success' && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Mesajınız başarıyla iletildi. En kısa sürede size dönüş yapacağız.
            </div>
          )}
          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <ButtonPrimary type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Gönderiliyor...' : 'Mesaj Gönder'}
          </ButtonPrimary>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
