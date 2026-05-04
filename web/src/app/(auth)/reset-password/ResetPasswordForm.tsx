'use client'

import { apiResetPassword } from '@/lib/api'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  // Token-level errors (used/expired/invalid) — show "Yeni Bağlantı Talep Et" CTA instead of retry
  const [tokenInvalid, setTokenInvalid] = useState(false)

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
        const msg = (res?.message as string) || 'Şifre güncellenemedi.'
        // Detect token-level errors so we can show the "yeni bağlantı talep et" CTA
        const isTokenIssue =
          /bağlantı|token|geçersiz|süresi|kullanılmış/i.test(msg) || res?.statusCode === 400
        setStatus('error')
        setErrorMsg(msg)
        if (isTokenIssue) setTokenInvalid(true)
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
            <div className="space-y-3">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {errorMsg}
              </div>
              {tokenInvalid && (
                <Link
                  href="/forgot-password"
                  className="block w-full rounded-full bg-primary-700 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-800"
                >
                  Yeni Şifre Sıfırlama Bağlantısı Talep Et
                </Link>
              )}
            </div>
          )}

          {!tokenInvalid && (
            <ButtonPrimary className="w-full" type="submit" disabled={status === 'loading' || status === 'success'}>
              {status === 'loading' ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </ButtonPrimary>
          )}
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
