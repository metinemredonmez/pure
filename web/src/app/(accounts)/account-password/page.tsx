'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function PasswordPage() {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    const fd = new FormData(e.currentTarget)
    const currentPassword = String(fd.get('currentPassword') || '')
    const newPassword = String(fd.get('newPassword') || '')
    const confirmPassword = String(fd.get('confirmPassword') || '')

    if (!currentPassword || !newPassword) {
      setMsg(t('password.fill_all_fields', 'Lütfen tüm alanları doldurun.'))
      setMsgType('error')
      setSaving(false)
      return
    }
    if (newPassword.length < 6) {
      setMsg(t('password.min_length', 'Yeni şifre en az 6 karakter olmalıdır.'))
      setMsgType('error')
      setSaving(false)
      return
    }
    if (newPassword !== confirmPassword) {
      setMsg(t('password.mismatch', 'Yeni şifre ve onay şifresi eşleşmiyor.'))
      setMsgType('error')
      setSaving(false)
      return
    }

    const token = localStorage.getItem('pureolentia_token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()

      if (res.ok && data?.success !== false) {
        setMsg(t('password.update_success', 'Şifreniz başarıyla güncellendi.'))
        setMsgType('success')
        ;(e.currentTarget as HTMLFormElement).reset()
      } else {
        setMsg(data?.message || t('password.update_failed', 'Şifre güncellenemedi. Mevcut şifrenizi kontrol edin.'))
        setMsgType('error')
      }
    } catch {
      setMsg(t('common.error_try_again', 'Bir hata oluştu. Lütfen tekrar deneyin.'))
      setMsgType('error')
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold">{t('password.title', 'Şifre Değiştir')}</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          {t('password.subtitle', 'Hesabınızın güvenliği için şifrenizi düzenli olarak güncelleyin.')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Fieldset>
          <FieldGroup className="max-w-xl">
            <Field>
              <Label>{t('password.current', 'Mevcut Şifre')}</Label>
              <Input type="password" name="currentPassword" required autoComplete="current-password" />
            </Field>
            <Field>
              <Label>{t('password.new', 'Yeni Şifre')}</Label>
              <Input type="password" name="newPassword" required autoComplete="new-password" />
            </Field>
            <Field>
              <Label>{t('password.confirm', 'Yeni Şifre (Tekrar)')}</Label>
              <Input type="password" name="confirmPassword" required autoComplete="new-password" />
            </Field>

            {msg && (
              <div className={`rounded-lg px-4 py-3 text-sm ${msgType === 'success' ? 'border border-green-200 bg-green-50 text-green-800' : 'border border-red-200 bg-red-50 text-red-800'}`}>
                {msg}
              </div>
            )}

            <div className="pt-2">
              <ButtonPrimary type="submit" disabled={saving}>
                {saving ? t('common.updating', 'Güncelleniyor...') : t('password.submit', 'Şifreyi Güncelle')}
              </ButtonPrimary>
            </div>
          </FieldGroup>
        </Fieldset>
      </form>
    </div>
  )
}
