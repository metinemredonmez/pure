'use client'

import { apiForgotPassword } from '@/lib/api'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { useState } from 'react'

export default function ForgotPasswordForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') || '').trim()

    if (!email) {
      setStatus('error')
      setErrorMsg('Lütfen e-posta adresinizi girin.')
      return
    }

    try {
      const res = (await apiForgotPassword(email)) as any
      if (res?.success === false) {
        setStatus('error')
        setErrorMsg(res?.message || 'E-posta gönderilemedi.')
        return
      }
      setStatus('success')
      ;(e.currentTarget as HTMLFormElement).reset()
    } catch {
      setStatus('error')
      setErrorMsg('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup>
          <Field>
            <Label>E-posta Adresi</Label>
            <Input type="email" name="email" placeholder="ornek@email.com" required autoComplete="email" />
          </Field>

          {status === 'success' && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. E-postanızı kontrol edin.
            </div>
          )}
          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <ButtonPrimary className="w-full" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
          </ButtonPrimary>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
