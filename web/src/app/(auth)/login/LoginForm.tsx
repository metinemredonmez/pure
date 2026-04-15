'use client'

import { apiLogin } from '@/lib/api'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')

    if (!email || !password) {
      setStatus('error')
      setErrorMsg('E-posta ve şifre gerekli.')
      return
    }

    try {
      const res = (await apiLogin(email, password)) as any
      const data = res?.data || res
      const token = data?.accessToken || data?.token || data?.tokens?.accessToken
      const refreshToken = data?.refreshToken || data?.tokens?.refreshToken
      const user = data?.user

      if (res?.success === false || !token) {
        setStatus('error')
        setErrorMsg(res?.message || 'E-posta veya şifre hatalı.')
        return
      }

      // Persist token + user for the session
      if (typeof window !== 'undefined') {
        localStorage.setItem('pureolentia_token', token)
        if (refreshToken) localStorage.setItem('pureolentia_refresh_token', refreshToken)
        if (user) localStorage.setItem('pureolentia_user', JSON.stringify(user))
      }

      router.push('/account')
      router.refresh()
    } catch {
      setStatus('error')
      setErrorMsg('Giriş yapılamadı. Lütfen tekrar deneyin.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup className="sm:space-y-6">
          <Field>
            <Label>E-posta</Label>
            <Input type="email" name="email" placeholder="ornek@email.com" required autoComplete="email" />
          </Field>
          <Field>
            <Label className="flex items-center justify-between gap-2">
              <span>Şifre</span>
              <Link className="text-sm font-normal text-primary-600" href="/forgot-password">
                Şifremi unuttum
              </Link>
            </Label>
            <Input type="password" name="password" required autoComplete="current-password" />
          </Field>

          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <ButtonPrimary className="mt-2 w-full" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </ButtonPrimary>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
