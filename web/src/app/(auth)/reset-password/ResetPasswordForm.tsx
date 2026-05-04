'use client'

import { apiResetPassword } from '@/lib/api'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    if (!token) {
      setStatus('error')
      setErrorMsg('Geçersiz veya eksik token. Lütfen email\'deki linki tekrar açın.')
      return
    }

    const formData = new FormData(e.currentTarget)
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (password.length < 8) {
      setStatus('error')
      setErrorMsg('Şifre en az 8 karakter olmalı.')
      return
    }
    if (password !== confirmPassword) {
      setStatus('error')
      setErrorMsg('Şifreler eşleşmiyor.')
      return
    }

    try {
      const res = (await apiResetPassword(token, password)) as any
      if (res?.success === false) {
        setStatus('error')
        setErrorMsg(res?.message || 'Şifre güncellenemedi. Token süresi dolmuş olabilir.')
        return
      }
      setStatus('success')
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setStatus('error')
      setErrorMsg('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  if (!token) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Geçersiz veya eksik token. Şifre sıfırlama bağlantısını e-postanızdan tekrar açın.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup>
          <Field>
            <Label>Yeni Şifre</Label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          <Field>
            <Label>Yeni Şifre (Tekrar)</Label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>

          {status === 'success' && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
            </div>
          )}
          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <ButtonPrimary className="w-full" type="submit" disabled={status === 'loading' || status === 'success'}>
            {status === 'loading' ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </ButtonPrimary>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
