'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonThird from '@/shared/Button/ButtonThird'
import { apiCreateAddress, apiCreateCheckoutSession, apiCreateOrder } from '@/lib/api'
import { Checkbox, CheckboxField } from '@/shared/checkbox'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import { Field, FieldGroup, Fieldset, Label, Legend } from '@/shared/fieldset'
import { Subheading } from '@/shared/heading'
import { Input } from '@/shared/input'
import { Radio, RadioField, RadioGroup } from '@/shared/radio'
import { Select } from '@/shared/select'
import {
  CreditCardIcon,
  CreditCardPosIcon,
  InternetIcon,
  Route02Icon,
  Tick02Icon,
  UserCircle02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react'
import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

type Tab = 'ContactInfo' | 'ShippingAddress' | 'PaymentMethod'

const Information = () => {
  const [tabActive, setTabActive] = useState<Tab>('ShippingAddress')
  const [checkoutData, setCheckoutData] = useState<Record<string, any>>({})

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id)
    setTimeout(() => {
      element?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div id="ContactInfo" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="İletişim Bilgileri"
          icon={UserCircle02Icon}
          value=""
          onClickChange={() => {
            setTabActive('ContactInfo')
            handleScrollToEl('ContactInfo')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'ContactInfo' && 'invisible hidden')}>
          <ContactInfo
            onSave={(values) => setCheckoutData((current) => ({ ...current, ...values }))}
            onClose={() => {
              setTabActive('ShippingAddress')
              handleScrollToEl('ShippingAddress')
            }}
          />
        </div>
      </div>

      <div id="ShippingAddress" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Teslimat Adresi"
          icon={Route02Icon}
          value=""
          onClickChange={() => {
            setTabActive('ShippingAddress')
            handleScrollToEl('ShippingAddress')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'ShippingAddress' && 'invisible hidden')}>
          <ShippingAddress
            onSave={(values) => setCheckoutData((current) => ({ ...current, ...values }))}
            onClose={() => {
              setTabActive('PaymentMethod')
              handleScrollToEl('PaymentMethod')
            }}
          />
        </div>
      </div>

      <div id="PaymentMethod" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Ödeme Yöntemi"
          icon={CreditCardPosIcon}
          value=""
          onClickChange={() => {
            setTabActive('PaymentMethod')
            handleScrollToEl('PaymentMethod')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'PaymentMethod' && 'invisible hidden')}>
          <PaymentMethod
            checkoutData={checkoutData}
            onClose={() => {
              setTabActive('ShippingAddress')
              handleScrollToEl('ShippingAddress')
            }}
          />
        </div>
      </div>
    </div>
  )
}

const TabHeader = ({
  title,
  icon,
  value,
  onClickChange,
}: {
  title: string
  icon: IconSvgElement
  value: string
  onClickChange: () => void
}) => {
  return (
    <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
      <HugeiconsIcon icon={icon} size={24} className="sm:mt-1.5" />
      <div className="sm:pl-3">
        <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
          <span className="tracking-tight uppercase">{title}</span>
          <HugeiconsIcon icon={Tick02Icon} size={24} className="mb-1 text-primary-500" />
        </h3>
        <div className="mt-1 text-sm font-semibold">{value}</div>
      </div>
      <button
        className="rounded-lg bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700"
        onClick={onClickChange}
        type="button"
      >
        Değiştir
      </button>
    </div>
  )
}

const ContactInfo = ({ onClose, onSave }: { onClose: () => void; onSave: (values: Record<string, any>) => void }) => {
  return (
    <form
      action="#"
      method="POST"
      onSubmit={(e) => {
        e.preventDefault()
        const formValues = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        onSave(formValues)
        onClose()
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">İletişim Bilgileri</h3>
            <p className="text-sm">
              Hesabınız yok mu?{` `}
              <Link href="/login" className="font-medium underline">
                Giris Yap
              </Link>
            </p>
          </div>
          <Field className="max-w-lg">
            <Label>Telefon Numarası</Label>
            <Input placeholder="05XX XXX XX XX" type="tel" name="phone" />
          </Field>
          <Field className="max-w-lg">
            <Label>E-posta Adresi</Label>
            <Input type="email" name="email" />
          </Field>
          <Field>
            <CheckboxField>
              <Checkbox name="newsletter" defaultChecked />
              <Label>Bana yenilikler ve kampanyaları gönder</Label>
            </CheckboxField>
          </Field>

          {/* ============ */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            <ButtonPrimary type="submit">Teslimat Adresine Geç</ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              İptal
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

const ShippingAddress = ({ onClose, onSave }: { onClose: () => void; onSave: (values: Record<string, any>) => void }) => {
  return (
    <form
      action="#"
      method="POST"
      onSubmit={(e) => {
        e.preventDefault()
        const formValues = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        onSave(formValues)
        onClose()
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
            <Field>
              <Label>Ad</Label>
              <Input placeholder="Adınız" name="first-name" />
            </Field>
            <Field>
              <Label>Soyad</Label>
              <Input placeholder="Soyadınız" name="last-name" />
            </Field>
          </div>

          {/* ============ */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
            <Field className="sm:col-span-2">
              <Label>Adres</Label>
              <Input placeholder="Sokak, mahalle, no" defaultValue={''} type={'text'} name="address" />
            </Field>
            <Field>
              <Label>Daire / Kat</Label>
              <Input defaultValue="" name="apt-suite" />
            </Field>
          </div>

          {/* ============ */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
            <Field>
              <Label>İl</Label>
              <Input defaultValue="" name="city" />
            </Field>
            <Field>
              <Label>Ülke</Label>
              <Select defaultValue="Türkiye" name="country">
                <option value="Turkey">Türkiye</option>
                
                
                
                
                
                
                
              </Select>
            </Field>
            <Field>
              <Label>İlçe</Label>
              <Input defaultValue="" name="state-province" />
            </Field>
            <Field>
              <Label>Posta Kodu</Label>
              <Input defaultValue="" name="postal-code" />
            </Field>
          </div>

          <Field className="max-w-lg">
            <Legend>Adres Tipi</Legend>
            <RadioGroup
              className="mt-1.5 grid grid-cols-1 gap-2 space-y-0! sm:grid-cols-2 sm:gap-3"
              name="address-type"
              defaultValue="at-home"
              aria-label="Address type"
            >
              <RadioField>
                <Label>
                  <span className="text-sm font-medium">
                    Ev <span className="font-light">(Gün Boyu Teslimat)</span>
                  </span>
                </Label>
                <Radio value="at-home" defaultChecked />
              </RadioField>

              <RadioField>
                <Label>
                  <span className="text-sm font-medium">
                    İş Yeri{' '}
                    <span className="font-light">
                      (Teslimat <span className="font-medium">09:00 - 17:00</span>)
                    </span>
                  </span>
                </Label>
                <Radio value="at-office" />
              </RadioField>
            </RadioGroup>
          </Field>

          {/* ============ */}
          <div className="flex flex-wrap gap-2.5 pt-6">
            <ButtonPrimary type="submit">Ödeme Yöntemine Geç</ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              İptal
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

const PaymentMethod = ({ onClose, checkoutData }: { onClose: () => void; checkoutData: Record<string, any> }) => {
  const [methodActive, setMethodActive] = useState<'Credit-Card' | 'Internet-banking'>('Credit-Card')
  const [submitting, setSubmitting] = useState(false)

  return (
    <form
      action="#"
      method="POST"
      onSubmit={async (e) => {
        e.preventDefault()
        const paymentValues = Object.fromEntries(new FormData(e.target as HTMLFormElement)) as Record<string, any>
        const token = localStorage.getItem('pureolentia_token')

        if (!token) {
          toast.error('Odeme icin once giris yapmaniz gerekiyor.')
          return
        }

        const firstName = String(checkoutData['first-name'] || '').trim()
        const lastName = String(checkoutData['last-name'] || '').trim()
        const phone = String(checkoutData.phone || '').trim()
        const address = String(checkoutData.address || '').trim()
        const city = String(checkoutData.city || '').trim()
        const district = String(checkoutData['state-province'] || '').trim()
        const postalCode = String(checkoutData['postal-code'] || '').trim()

        if (!firstName || !lastName || !phone || !address || !city || !district || !postalCode) {
          toast.error('Odeme oncesi iletisim ve adres bilgilerini eksiksiz doldurun.')
          return
        }

        try {
          setSubmitting(true)

          const addressRes = await apiCreateAddress(token, {
            title: checkoutData['address-type'] === 'at-office' ? 'Is Yeri' : 'Ev',
            firstName,
            lastName,
            phone,
            line1: address,
            line2: String(checkoutData['apt-suite'] || '').trim() || undefined,
            city,
            district,
            postalCode,
            country: 'TR',
            isDefault: true,
          })

          const addressId = addressRes?.data?.id || addressRes?.id
          if (!addressId) throw new Error(addressRes?.message || 'Adres olusturulamadi')

          const orderRes = await apiCreateOrder(token, { addressId })
          const orderId = orderRes?.data?.id || orderRes?.id
          if (!orderId) throw new Error(orderRes?.message || 'Siparis olusturulamadi')

          if (methodActive === 'Internet-banking') {
            toast.success('Siparis olusturuldu. Havale/EFT akisi henuz otomatik baglanmadi.')
            return
          }

          const checkoutRes = await apiCreateCheckoutSession(token, {
            orderId,
            method: 'CREDIT_CARD',
          })

          const iframeUrl = checkoutRes?.data?.iframeUrl || checkoutRes?.iframeUrl
          if (!iframeUrl) throw new Error(checkoutRes?.message || 'Odeme oturumu baslatilamadi')

          window.location.href = iframeUrl
        } catch (error: any) {
          toast.error(error?.message || 'Odeme baslatilamadi')
        } finally {
          setSubmitting(false)
        }
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          {/* Kredi / Banka Kartı */}
          <div className="rounded-xl border border-neutral-200 p-4 transition hover:border-primary-300 dark:border-neutral-700">
            <RadioGroup
              name="payment-method"
              aria-label="Ödeme yöntemi"
              onChange={(e) => setMethodActive(e as any)}
              value={methodActive}
            >
              <RadioField className="sm:gap-x-4">
                <Radio className="mt-0.5" value="Credit-Card" />
                <Label className="flex flex-1 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                      <HugeiconsIcon icon={CreditCardIcon} size={20} className="text-primary-700" />
                    </div>
                    <div>
                      <p className="font-semibold">Kredi / Banka Kartı</p>
                      <p className="text-xs text-neutral-500">Visa, Mastercard, Troy — Taksit imkanı</p>
                    </div>
                  </div>
                  <div className="hidden items-center gap-1.5 sm:flex">
                    <div className="flex h-6 w-9 items-center justify-center rounded border bg-white text-[8px] font-bold text-blue-700">VISA</div>
                    <div className="flex h-6 w-9 items-center justify-center rounded border bg-white"><div className="flex -space-x-1"><div className="h-3 w-3 rounded-full bg-red-500 opacity-80"></div><div className="h-3 w-3 rounded-full bg-yellow-500 opacity-80"></div></div></div>
                    <div className="flex h-6 w-9 items-center justify-center rounded border bg-white text-[7px] font-bold text-blue-900">TROY</div>
                  </div>
                </Label>
              </RadioField>
            </RadioGroup>

            <div className={clsx('mt-4 space-y-4 border-t pt-4', methodActive !== 'Credit-Card' && 'hidden')}>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>256-bit SSL ile güvenli ödeme — PayTR altyapısı</span>
                </div>
              </div>
              <Field className="max-w-lg">
                <Label>Kart Numarası</Label>
                <Input autoComplete="cc-number" name="card-number" placeholder="0000 0000 0000 0000" />
              </Field>
              <Field className="max-w-lg">
                <Label>Kart Üzerindeki İsim</Label>
                <Input autoComplete="cc-name" name="name-on-card" placeholder="AD SOYAD" />
              </Field>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Field className="flex-2/3">
                  <Label>Son Kullanma Tarihi</Label>
                  <Input autoComplete="cc-exp" placeholder="AA/YY" name="expiration-date" />
                </Field>
                <Field className="flex-1/3">
                  <Label>CVC</Label>
                  <Input autoComplete="cc-csc" placeholder="•••" name="cvc" type="password" />
                </Field>
              </div>
              <Field>
                <CheckboxField>
                  <Checkbox name="save-card" />
                  <Label className="text-sm">Bu kartı sonraki alışverişlerim için kaydet</Label>
                </CheckboxField>
              </Field>
            </div>
          </div>

          {/* Havale / EFT */}
          <div className="rounded-xl border border-neutral-200 p-4 transition hover:border-primary-300 dark:border-neutral-700">
            <RadioGroup
              name="payment-method"
              aria-label="Ödeme yöntemi"
              onChange={(e) => setMethodActive(e as any)}
              value={methodActive}
            >
              <RadioField className="sm:gap-x-4">
                <Radio className="mt-0.5" value="Internet-banking" />
                <Label className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                    <HugeiconsIcon icon={InternetIcon} size={20} className="text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold">Havale / EFT</p>
                    <p className="text-xs text-neutral-500">Banka havalesi ile ödeme</p>
                  </div>
                </Label>
              </RadioField>
            </RadioGroup>

            <div className={clsx('mt-4 border-t pt-4', methodActive !== 'Internet-banking' && 'hidden')}>
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="mb-3 text-sm font-medium text-blue-800 dark:text-blue-300">Havale yaptıktan sonra siparişiniz işleme alınacaktır.</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Banka</span><span className="font-medium">İş Bankası</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Hesap Sahibi</span><span className="font-medium">Pure Olentia Gıda Ltd. Şti.</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">IBAN</span><span className="font-mono text-xs font-medium">TR00 0000 0000 0000 0000 0000 00</span></div>
                </div>
              </div>
              <p className="mt-3 text-xs text-neutral-400">* IBAN bilgileri admin panelden yönetilir. Gerçek IBAN'ı admin'den girin.</p>
            </div>
          </div>

          {/* Güvenlik rozetleri */}
          <div className="flex flex-wrap items-center justify-center gap-4 rounded-lg bg-neutral-50 px-4 py-3 dark:bg-neutral-800">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Güvenli Ödeme</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>3D Secure</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-4">
            <ButtonPrimary className="min-w-56" type="submit" disabled={submitting}>
              {submitting ? 'Yonlendiriliyor...' : 'Siparişi Onayla'}
            </ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              Teslimat Adresine Dön
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

export default Information
