'use client'

import { apiRegister } from '@/lib/api'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignupForm() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    const payload = {
      firstName: String(fd.get('firstName') || '').trim(),
      lastName: String(fd.get('lastName') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      password: String(fd.get('password') || ''),
      privacyAccepted: true,
    }

    if (!payload.firstName || !payload.email || !payload.password) {
      setStatus('error')
      setErrorMsg('Lütfen ad, e-posta ve şifre alanlarını doldurun.')
      return
    }
    if (payload.password.length < 6) {
      setStatus('error')
      setErrorMsg('Şifre en az 6 karakter olmalıdır.')
      return
    }

    try {
      const res = (await apiRegister(payload)) as any
      const data = res?.data || res
      const token = data?.accessToken || data?.token || data?.tokens?.accessToken
      const refreshToken = data?.refreshToken || data?.tokens?.refreshToken
      const user = data?.user

      if (res?.success === false || !token) {
        setStatus('error')
        setErrorMsg(res?.message || 'Kayıt başarısız. E-posta zaten kullanılıyor olabilir.')
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('pureolentia_token', token)
        if (refreshToken) localStorage.setItem('pureolentia_refresh_token', refreshToken)
        if (user) localStorage.setItem('pureolentia_user', JSON.stringify(user))
      }

      router.push('/account')
      router.refresh()
    } catch {
      setStatus('error')
      setErrorMsg('Kayıt yapılamadı. Lütfen tekrar deneyin.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup className="sm:space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label>Ad</Label>
              <Input type="text" name="firstName" placeholder="Adınız" required autoComplete="given-name" />
            </Field>
            <Field>
              <Label>Soyad</Label>
              <Input type="text" name="lastName" placeholder="Soyadınız" autoComplete="family-name" />
            </Field>
          </div>
          <Field>
            <Label>E-posta</Label>
            <Input type="email" name="email" placeholder="ornek@email.com" required autoComplete="email" />
          </Field>
          <Field>
            <Label>Şifre</Label>
            <Input type="password" name="password" required autoComplete="new-password" />
          </Field>

          <div className="flex items-start gap-3">
            <input type="checkbox" name="privacy" required className="mt-1 h-4 w-4 rounded border-neutral-300" />
            <label className="text-sm text-neutral-600 dark:text-neutral-400">
              <a href="/kvkk" target="_blank" className="text-primary-600 underline">KVKK Aydınlatma Metni</a>'ni ve{' '}
              <a href="/gizlilik-politikasi" target="_blank" className="text-primary-600 underline">Gizlilik Politikası</a>'nı okudum, kabul ediyorum.
            </label>
          </div>

          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <ButtonPrimary className="mt-2 w-full" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
          </ButtonPrimary>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
