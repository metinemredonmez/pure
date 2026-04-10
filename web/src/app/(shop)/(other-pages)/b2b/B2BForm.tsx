'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Textarea } from '@/shared/textarea'
import { useRef, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function B2BForm() {
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
      setErrorMsg('Lütfen ad, firma ve e-posta alanlarını doldurun.')
      return
    }

    // Combine B2B-specific fields into a single structured message body
    // so it reaches the admin inbox via the shared /public/contact-message
    // endpoint without requiring a new backend route.
    const composedMessage = [
      `Firma: ${company}`,
      sector && `Sektör: ${sector}`,
      volume && `Aylık Tüketim: ${volume} kg`,
      phone && `Telefon: ${phone}`,
      '',
      message || '(Mesaj girilmedi)',
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const res = await fetch(`${API_URL}/public/contact-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          subject: `[B2B Teklif Talebi] ${company}`,
          message: composedMessage,
        }),
      })

      if (!res.ok) {
        let serverMsg = ''
        try {
          const errBody = await res.json()
          serverMsg = errBody?.message || errBody?.data?.message || ''
        } catch {}
        setStatus('error')
        setErrorMsg(serverMsg || `Teklif talebi gönderilemedi (kod ${res.status}).`)
        return
      }

      setStatus('success')
      formRef.current?.reset()
    } catch {
      setStatus('error')
      setErrorMsg('Sunucuya ulaşılamadı. Lütfen birkaç dakika sonra tekrar deneyin.')
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-10">
      <Fieldset>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label>Ad Soyad</Label>
              <Input name="name" placeholder="Adınız Soyadınız" required />
            </Field>
            <Field>
              <Label>Firma Adı</Label>
              <Input name="company" placeholder="Firma adı" required />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label>E-posta</Label>
              <Input name="email" type="email" placeholder="ornek@firma.com" required />
            </Field>
            <Field>
              <Label>Telefon</Label>
              <Input name="phone" placeholder="+90 5XX XXX XX XX" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label>Sektör</Label>
              <Input name="sector" placeholder="Otel, Restoran, Ofis..." />
            </Field>
            <Field>
              <Label>Aylık Tüketim (kg)</Label>
              <Input name="volume" type="number" placeholder="Örneğin: 50" />
            </Field>
          </div>
          <Field>
            <Label>Mesajınız</Label>
            <Textarea name="message" rows={4} placeholder="İhtiyaçlarınızı anlatabilirsiniz..." />
          </Field>

          {status === 'success' && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Teklif talebiniz başarıyla iletildi. 24 saat içinde size dönüş yapacağız.
            </div>
          )}
          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <ButtonPrimary type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Gönderiliyor...' : 'Teklif Talep Et'}
          </ButtonPrimary>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
