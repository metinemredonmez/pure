'use client'

import { useTranslation } from '@/contexts/LanguageContext'
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

const TR_PROVINCES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis',
  'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye',
  'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop', 'Şırnak', 'Sivas',
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
]

export default function AccountPage() {
  const { t } = useTranslation()
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
      } else {
        // Fallback to localStorage user data if API fails (token expired etc.)
        try {
          const cached = localStorage.getItem('pureolentia_user')
          if (cached) setUser(JSON.parse(cached))
        } catch {}
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
      city: String(fd.get('city') || ''),
      district: String(fd.get('district') || ''),
      postalCode: String(fd.get('postalCode') || ''),
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
    return <div className="py-20 text-center text-neutral-400">{t('common.loading', 'Yükleniyor...')}</div>
  }

  if (!user) {
    return <div className="py-20 text-center text-neutral-400">{t('account.login_required', 'Giriş yapmanız gerekiyor.')}</div>
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('account.info_title', 'Hesap Bilgileri')}</h1>

      <form onSubmit={handleSubmit}>
        <Fieldset>
          <FieldGroup className="max-w-2xl space-y-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label>{t('form.first_name', 'Ad')}</Label>
                <Input name="firstName" defaultValue={user.firstName || ''} />
              </Field>
              <Field>
                <Label>{t('form.last_name', 'Soyad')}</Label>
                <Input name="lastName" defaultValue={user.lastName || ''} />
              </Field>
            </div>

            <Field>
              <Label>{t('form.email', 'E-posta')}</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={Mail01Icon} size={16} />
                <Input name="email" type="email" defaultValue={user.email || ''} disabled className="opacity-60" />
              </InputGroup>
              <p className="mt-1 text-xs text-neutral-400">{t('account.email_immutable', 'E-posta adresi değiştirilemez.')}</p>
            </Field>

            <Field>
              <Label>{t('form.phone', 'Telefon')}</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={SmartPhone01Icon} size={16} />
                <Input name="phone" defaultValue={user.phone || ''} placeholder="05XX XXX XX XX" />
              </InputGroup>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label>{t('form.city', 'Şehir')}</Label>
                <select
                  name="city"
                  defaultValue={user.city || ''}
                  className="block w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <option value="">{t('form.select_city', '— Şehir Seçin —')}</option>
                  {TR_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field>
                <Label>{t('form.district', 'İlçe')}</Label>
                <Input name="district" defaultValue={user.district || ''} placeholder={t('form.district_placeholder', 'Örn: Sancaktepe')} />
              </Field>
            </div>

            <Field>
              <Label>{t('form.address', 'Açık Adres')}</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={MapsLocation01Icon} size={16} />
                <Input name="address" defaultValue={user.address || ''} placeholder={t('form.address_placeholder', 'Mahalle, sokak, kapı no, daire')} />
              </InputGroup>
            </Field>

            <Field>
              <Label>{t('form.postal_code_optional', 'Posta Kodu (opsiyonel)')}</Label>
              <Input name="postalCode" defaultValue={user.postalCode || ''} placeholder="34887" />
            </Field>

            {msg && (
              <div className={`rounded-lg px-4 py-3 text-sm ${msg.includes('güncellendi') ? 'border border-green-200 bg-green-50 text-green-800' : 'border border-red-200 bg-red-50 text-red-800'}`}>
                {msg}
              </div>
            )}

            <div className="pt-2">
              <ButtonPrimary type="submit" disabled={saving}>
                {saving ? t('common.saving', 'Kaydediliyor...') : t('account.update_info', 'Bilgileri Güncelle')}
              </ButtonPrimary>
            </div>
          </FieldGroup>
        </Fieldset>
      </form>
    </div>
  )
}
