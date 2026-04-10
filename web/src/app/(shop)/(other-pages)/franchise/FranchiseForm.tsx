'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Textarea } from '@/shared/textarea'
import { useRef, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function FranchiseForm() {
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
      setErrorMsg('Lütfen ad soyad, telefon, e-posta ve şehir alanlarını doldurun.')
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
        setErrorMsg(serverMsg || `Başvuru gönderilemedi (kod ${res.status}).`)
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
              <Input name="fullName" required />
            </Field>
            <Field>
              <Label>Telefon</Label>
              <Input name="phone" type="tel" placeholder="+90 5XX XXX XX XX" required />
            </Field>
          </div>
          <Field>
            <Label>E-posta</Label>
            <Input name="email" type="email" placeholder="ornek@email.com" required />
          </Field>
          <Field>
            <Label>Şehir</Label>
            <Input name="city" placeholder="Hangi şehirde açmayı düşünüyorsunuz?" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label>Lokasyon Tipi</Label>
              <select
                name="locationType"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                defaultValue="cadde"
              >
                <option value="cadde">Cadde üzeri</option>
                <option value="avm">AVM</option>
                <option value="ofis">Ofis bölgesi</option>
                <option value="diger">Diğer</option>
              </select>
            </Field>
            <Field>
              <Label>Planlanan Açılış</Label>
              <select
                name="plannedOpenDate"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                defaultValue="hemen"
              >
                <option value="hemen">Hemen</option>
                <option value="1-3-ay">1-3 ay</option>
                <option value="3-6-ay">3-6 ay</option>
                <option value="6-ay-sonrasi">6 ay sonrası</option>
              </select>
            </Field>
          </div>
          <Field>
            <Label>Yatırım Bütçesi</Label>
            <select
              name="budget"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              defaultValue="500000-1000000"
            >
              <option value="500000-alti">500.000 TL altı</option>
              <option value="500000-1000000">500.000 - 1.000.000 TL</option>
              <option value="1000000-2000000">1.000.000 - 2.000.000 TL</option>
              <option value="2000000-uzeri">2.000.000 TL ve üzeri</option>
            </select>
          </Field>
          <Field>
            <Label>İş Deneyiminiz (opsiyonel)</Label>
            <Textarea name="experience" rows={3} placeholder="Daha önce işletme tecrübeniz var mı?" />
          </Field>
          <Field>
            <Label>Ek Notlar (opsiyonel)</Label>
            <Textarea name="notes" rows={3} placeholder="Eklemek istediğiniz notlar..." />
          </Field>

          {status === 'success' && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Başvurunuz başarıyla alındı. Ekibimiz 3 iş günü içinde size dönüş yapacak.
            </div>
          )}
          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <ButtonPrimary type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Gönderiliyor...' : 'Başvurumu Gönder'}
          </ButtonPrimary>
          <p className="text-center text-xs text-neutral-400">
            Başvurunuz 3 iş günü içinde değerlendirilecektir.
          </p>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
