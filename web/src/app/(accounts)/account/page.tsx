'use client'

import { apiGetMe, apiUpdateProfile } from '@/lib/api'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input, InputGroup } from '@/shared/input'
import {
  Mail01Icon,
  MapsLocation01Icon,
  SmartPhone01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('pureolentia_token')
    if (!token) {
      window.location.href = '/login'
      return
    }
    apiGetMe(token).then((res: any) => {
      const data = res?.data || res
      if (data?.id) {
        setUser(data)
        localStorage.setItem('pureolentia_user', JSON.stringify(data))
      }
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    const token = localStorage.getItem('pureolentia_token')
    if (!token) return

    const fd = new FormData(e.currentTarget)
    const payload = {
      firstName: String(fd.get('firstName') || ''),
      lastName: String(fd.get('lastName') || ''),
      phone: String(fd.get('phone') || ''),
      address: String(fd.get('address') || ''),
    }

    try {
      const res = (await apiUpdateProfile(token, payload)) as any
      if (res?.data || res?.id) {
        setMsg('Bilgileriniz güncellendi.')
        const updated = res?.data || res
        setUser(updated)
        localStorage.setItem('pureolentia_user', JSON.stringify(updated))
      } else {
        setMsg(res?.message || 'Güncelleme başarısız.')
      }
    } catch {
      setMsg('Bir hata oluştu.')
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="py-20 text-center text-neutral-400">Yükleniyor...</div>
  }

  if (!user) {
    return <div className="py-20 text-center text-neutral-400">Giriş yapmanız gerekiyor.</div>
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <h1 className="text-2xl font-semibold sm:text-3xl">Hesap Bilgileri</h1>

      <form onSubmit={handleSubmit}>
        <Fieldset>
          <FieldGroup className="max-w-2xl space-y-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label>Ad</Label>
                <Input name="firstName" defaultValue={user.firstName || ''} />
              </Field>
              <Field>
                <Label>Soyad</Label>
                <Input name="lastName" defaultValue={user.lastName || ''} />
              </Field>
            </div>

            <Field>
              <Label>E-posta</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={Mail01Icon} size={16} />
                <Input name="email" type="email" defaultValue={user.email || ''} disabled className="opacity-60" />
              </InputGroup>
              <p className="mt-1 text-xs text-neutral-400">E-posta adresi değiştirilemez.</p>
            </Field>

            <Field>
              <Label>Telefon</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={SmartPhone01Icon} size={16} />
                <Input name="phone" defaultValue={user.phone || ''} placeholder="05XX XXX XX XX" />
              </InputGroup>
            </Field>

            <Field>
              <Label>Adres</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={MapsLocation01Icon} size={16} />
                <Input name="address" defaultValue={user.address || ''} placeholder="Şehir, İlçe" />
              </InputGroup>
            </Field>

            {msg && (
              <div className={`rounded-lg px-4 py-3 text-sm ${msg.includes('güncellendi') ? 'border border-green-200 bg-green-50 text-green-800' : 'border border-red-200 bg-red-50 text-red-800'}`}>
                {msg}
              </div>
            )}

            <div className="pt-2">
              <ButtonPrimary type="submit" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
              </ButtonPrimary>
            </div>
          </FieldGroup>
        </Fieldset>
      </form>
    </div>
  )
}
