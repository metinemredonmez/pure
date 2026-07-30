'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonThird from '@/shared/Button/ButtonThird'
import {
  apiCreateAddress,
  apiCreateCheckoutSession,
  apiCreateGuestCheckout,
  apiCreateOrder,
  apiGetAddresses,
  getStoredAccessToken,
} from '@/lib/api'
import { useCart, type CartItem } from '@/contexts/CartContext'
import { Checkbox, CheckboxField } from '@/shared/checkbox'
import { Field, FieldGroup, Fieldset, Label, Legend } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Radio, RadioField, RadioGroup } from '@/shared/radio'
import { Select } from '@/shared/select'
import {
  CheckmarkCircle02Icon,
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
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type Tab = 'ContactInfo' | 'ShippingAddress' | 'PaymentMethod'

// Türkiye'nin 81 ili (alfabetik)
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

// Sepet satırlarını backend sipariş kalemine çevir. Yalnızca gerçek DB varyant
// id'si gönderilir; sentetik satır kimliği ("250g__Orta") backend'de
// "variant not found" yapar. Eski kayıtlarda dbVariantId yoksa cuid görünümlü
// variantId'yi kullan.
function buildOrderItems(cartItems: CartItem[]) {
  return cartItems.map((item) => {
    const legacyId =
      item.variantId && !item.variantId.includes('__') && item.variantId.length >= 20
        ? item.variantId
        : undefined
    return {
      productId: item.productId,
      variantId: item.dbVariantId || legacyId,
      quantity: item.quantity,
    }
  })
}

const Information = () => {
  const [tabActive, setTabActive] = useState<Tab>('ContactInfo')
  const [checkoutData, setCheckoutData] = useState<Record<string, any>>({})
  const [prefillReady, setPrefillReady] = useState(false)
  // null = kontrol ediliyor, true = üye, false = misafir.
  // Token localStorage'da varsa SENKRON olarak üye kabul et — böylece üye
  // kullanıcıya "Giriş Yap" linki bir an bile görünmez (async doğrulama altta).
  const [isMember, setIsMember] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem('pureolentia_token') ? true : null
    } catch {
      return null
    }
  })
  const [memberLabel, setMemberLabel] = useState('')
  // Misafir "Üyeliksiz devam et" seçti mi
  const [guestChosen, setGuestChosen] = useState(false)
  const { items, coupon, removeCoupon } = useCart()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. localStorage kullanıcı profilinden ön-doldur
    try {
      const rawUser = localStorage.getItem('pureolentia_user')
      if (rawUser) {
        const user = JSON.parse(rawUser)
        setCheckoutData((current) => ({
          email: user?.email || '',
          phone: user?.phone || '',
          'first-name': user?.firstName || '',
          'last-name': user?.lastName || '',
          address: user?.address || '',
          city: user?.city || '',
          'state-province': user?.district || '',
          'postal-code': user?.postalCode || '',
          country: 'Turkey',
          ...current,
        }))
      }
    } catch {}

    // 2. Üyelik durumunu + backend adresini yükle
    ;(async () => {
      try {
        const token = await getStoredAccessToken()
        if (!token) {
          setIsMember(false)
          setPrefillReady(true)
          return
        }
        setIsMember(true)
        try {
          const rawUser = localStorage.getItem('pureolentia_user')
          if (rawUser) {
            const u = JSON.parse(rawUser)
            setMemberLabel(u?.email || `${u?.firstName || ''} ${u?.lastName || ''}`.trim())
          }
        } catch {}

        const res: any = await apiGetAddresses(token)
        const addresses: any[] = res?.data?.data || res?.data || res || []
        if (Array.isArray(addresses) && addresses.length > 0) {
          const def =
            addresses.find((a: any) => a.isDefault) ||
            [...addresses].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
          if (def) {
            setCheckoutData((current) => ({
              ...current,
              'first-name': current['first-name'] || def.firstName || '',
              'last-name': current['last-name'] || def.lastName || '',
              phone: current.phone || def.phone || '',
              address: current.address || def.line1 || '',
              'apt-suite': current['apt-suite'] || def.line2 || '',
              city: current.city || def.city || '',
              'state-province': current['state-province'] || def.district || '',
              'postal-code': current['postal-code'] || def.postalCode || '',
              country: current.country || (def.country === 'TR' ? 'Turkey' : def.country || 'Turkey'),
            }))
          }
        }
      } catch {
        setIsMember((prev) => (prev === null ? false : prev))
      }
      setPrefillReady(true)
    })()
  }, [])

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id)
    setTimeout(() => {
      element?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  // Adım özetleri (kapalı adımda gösterilir)
  const contactSummary = [checkoutData.email, checkoutData.phone].filter(Boolean).join(' · ')
  const addressSummary = [
    `${checkoutData['first-name'] || ''} ${checkoutData['last-name'] || ''}`.trim(),
    checkoutData.address,
    [checkoutData['state-province'], checkoutData.city].filter(Boolean).join('/'),
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Üye / Misafir seçimi ── */}
      {isMember === false && !guestChosen && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-5 dark:border-primary-900/40 dark:bg-primary-900/10">
          <h3 className="text-base font-semibold">Nasıl devam etmek istersiniz?</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Zaten üye misiniz? Giriş yaparak adres ve sipariş geçmişinize erişebilirsiniz. Dilerseniz üyeliksiz de devam edebilirsiniz.
          </p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <ButtonPrimary
              className="sm:min-w-44"
              onClick={() => {
                window.location.href = '/login?redirect=/checkout'
              }}
            >
              Giriş Yap
            </ButtonPrimary>
            <ButtonThird onClick={() => setGuestChosen(true)}>Üyeliksiz Devam Et</ButtonThird>
          </div>
        </div>
      )}

      {isMember === true && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 dark:border-emerald-900/40 dark:bg-emerald-900/15">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} className="shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            Üye olarak devam ediyorsunuz{memberLabel ? <> — <span className="font-semibold">{memberLabel}</span></> : ''}.
          </p>
        </div>
      )}

      {isMember === false && guestChosen && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-3.5 dark:border-neutral-700 dark:bg-neutral-800/60">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Üyeliksiz devam ediyorsunuz.</p>
          <button
            type="button"
            className="text-sm font-medium underline"
            onClick={() => {
              window.location.href = '/login?redirect=/checkout'
            }}
          >
            Giriş yap
          </button>
        </div>
      )}

      <div id="ContactInfo" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="İletişim Bilgileri"
          icon={UserCircle02Icon}
          value={tabActive !== 'ContactInfo' ? contactSummary : ''}
          onClickChange={() => {
            setTabActive('ContactInfo')
            handleScrollToEl('ContactInfo')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'ContactInfo' && 'invisible hidden')}>
          <ContactInfo
            initialValues={checkoutData}
            isMember={isMember === true}
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
          value={tabActive !== 'ShippingAddress' ? addressSummary : ''}
          onClickChange={() => {
            setTabActive('ShippingAddress')
            handleScrollToEl('ShippingAddress')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'ShippingAddress' && 'invisible hidden')}>
          {prefillReady ? (
            <ShippingAddress
              key={`shipping-${checkoutData.city || 'empty'}-${checkoutData['state-province'] || ''}`}
              initialValues={checkoutData}
              onSave={(values) => setCheckoutData((current) => ({ ...current, ...values }))}
              onClose={() => {
                setTabActive('PaymentMethod')
                handleScrollToEl('PaymentMethod')
              }}
            />
          ) : (
            <div className="py-8 text-center text-sm text-neutral-400">Adres bilgileri yükleniyor...</div>
          )}
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
            cartItems={items}
            isMember={isMember === true}
            couponCode={coupon?.code}
            onCouponInvalid={removeCoupon}
            onEditContact={() => {
              setTabActive('ContactInfo')
              handleScrollToEl('ContactInfo')
            }}
            onEditShipping={() => {
              setTabActive('ShippingAddress')
              handleScrollToEl('ShippingAddress')
            }}
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
      <div className="min-w-0 sm:pl-3">
        <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
          <span className="tracking-tight uppercase">{title}</span>
          {value ? <HugeiconsIcon icon={Tick02Icon} size={22} className="mb-1 text-emerald-500" /> : null}
        </h3>
        {value ? <div className="mt-1 truncate text-sm font-semibold">{value}</div> : null}
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

const ContactInfo = ({
  initialValues,
  isMember,
  onClose,
  onSave,
}: {
  initialValues: Record<string, any>
  isMember: boolean
  onClose: () => void
  onSave: (values: Record<string, any>) => void
}) => {
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
            {!isMember && (
              <p className="text-sm">
                Hesabınız var mı?{` `}
                <Link href="/login?redirect=/checkout" className="font-medium underline">
                  Giriş Yap
                </Link>
              </p>
            )}
          </div>
          <Field className="max-w-lg">
            <Label>Telefon Numarası</Label>
            <Input placeholder="05XX XXX XX XX" type="tel" name="phone" defaultValue={String(initialValues.phone || '')} />
          </Field>
          <Field className="max-w-lg">
            <Label>E-posta Adresi</Label>
            <Input type="email" name="email" defaultValue={String(initialValues.email || '')} />
          </Field>
          <Field>
            <CheckboxField>
              <Checkbox name="newsletter" defaultChecked />
              <Label>Bana yenilikler ve kampanyaları gönder</Label>
            </CheckboxField>
          </Field>

          {/* ============ */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            <ButtonPrimary type="submit">Onayla ve Devam Et</ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              İptal
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

const ShippingAddress = ({ initialValues, onClose, onSave }: { initialValues: Record<string, any>; onClose: () => void; onSave: (values: Record<string, any>) => void }) => {
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
              <Input placeholder="Adınız" name="first-name" defaultValue={String(initialValues['first-name'] || '')} />
            </Field>
            <Field>
              <Label>Soyad</Label>
              <Input placeholder="Soyadınız" name="last-name" defaultValue={String(initialValues['last-name'] || '')} />
            </Field>
          </div>

          {/* ============ */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
            <Field className="sm:col-span-2">
              <Label>Adres</Label>
              <Input placeholder="Sokak, mahalle, no" defaultValue={String(initialValues.address || '')} type={'text'} name="address" />
            </Field>
            <Field>
              <Label>Daire / Kat</Label>
              <Input defaultValue={String(initialValues['apt-suite'] || '')} name="apt-suite" />
            </Field>
          </div>

          {/* ============ */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
            <Field>
              <Label>İl</Label>
              <Select defaultValue={String(initialValues.city || '')} name="city">
                <option value="">Seçiniz...</option>
                {TR_PROVINCES.map((p) => (<option key={p} value={p}>{p}</option>))}
              </Select>
            </Field>
            <Field>
              <Label>Ülke</Label>
              <Select defaultValue={String(initialValues.country || 'Turkey')} name="country">
                <option value="Turkey">Türkiye</option>
              </Select>
            </Field>
            <Field>
              <Label>İlçe</Label>
              <Input placeholder="İlçe" defaultValue={String(initialValues['state-province'] || '')} name="state-province" />
            </Field>
            <Field>
              <Label>Posta Kodu (opsiyonel)</Label>
              <Input placeholder="34000" defaultValue={String(initialValues['postal-code'] || '')} name="postal-code" />
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
            <ButtonPrimary type="submit">Adresi Onayla ve Devam Et</ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              İptal
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

const PaymentMethod = ({
  onClose,
  checkoutData,
  cartItems,
  isMember,
  couponCode,
  onCouponInvalid,
  onEditContact,
  onEditShipping,
}: {
  onClose: () => void
  checkoutData: Record<string, any>
  cartItems: CartItem[]
  isMember: boolean
  couponCode?: string
  onCouponInvalid?: () => void
  onEditContact: () => void
  onEditShipping: () => void
}) => {
  const [methodActive, setMethodActive] = useState<'Credit-Card' | 'Internet-banking'>('Credit-Card')
  const [submitting, setSubmitting] = useState(false)

  const firstName = String(checkoutData['first-name'] || '').trim()
  const lastName = String(checkoutData['last-name'] || '').trim()
  const phone = String(checkoutData.phone || '').trim()
  const email = String(checkoutData.email || '').trim()
  const address = String(checkoutData.address || '').trim()
  const aptSuite = String(checkoutData['apt-suite'] || '').trim()
  const city = String(checkoutData.city || '').trim()
  const district = String(checkoutData['state-province'] || '').trim()
  const postalCode = String(checkoutData['postal-code'] || '').trim()

  return (
    <form
      action="#"
      method="POST"
      onSubmit={async (e) => {
        e.preventDefault()
        const paymentValues = Object.fromEntries(new FormData(e.target as HTMLFormElement)) as Record<string, any>

        // Posta kodu opsiyonel — müşteri talebi
        const missingFields = [
          !firstName && 'ad',
          !lastName && 'soyad',
          !phone && 'telefon',
          !email && 'e-posta',
          !address && 'adres',
          !city && 'il',
          !district && 'ilçe',
        ].filter(Boolean) as string[]

        if (missingFields.length > 0) {
          toast.error(`Eksik alanlar: ${missingFields.join(', ')}`)
          return
        }

        if (!paymentValues.termsAccepted) {
          toast.error('Odeme oncesi mesafeli satis ve kullanim kosullarini onaylayin.')
          return
        }

        if (cartItems.length === 0) {
          toast.error('Sepetiniz bos. Odeme icin once urun ekleyin.')
          return
        }

        try {
          // ── MİSAFİR (üyeliksiz) akış: tek public çağrı ──
          if (!isMember) {
            if (methodActive === 'Internet-banking') {
              toast.error('Havale/EFT için lütfen giriş yapın veya kart ile ödeyin.')
              return
            }
            setSubmitting(true)
            const guestRes = await apiCreateGuestCheckout({
              email,
              firstName,
              lastName,
              phone,
              line1: address,
              line2: aptSuite || undefined,
              city,
              district,
              postalCode: postalCode || undefined,
              couponCode: couponCode || undefined,
              method: 'CREDIT_CARD',
              items: buildOrderItems(cartItems),
            })
            const guestIframe = guestRes?.data?.iframeUrl || guestRes?.iframeUrl
            if (!guestIframe) throw new Error(guestRes?.message || 'Odeme oturumu baslatilamadi')
            // Sepeti burada TEMİZLEME — yalnızca /odeme/basarili temizler
            window.location.href = guestIframe
            return
          }

          // ── ÜYE akış ──
          const token = await getStoredAccessToken()
          if (!token) {
            toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın, sepetiniz korunacak.', { duration: 6000 })
            setTimeout(() => {
              window.location.href = '/login?redirect=/checkout'
            }, 2000)
            return
          }

          setSubmitting(true)

          const addressRes = await apiCreateAddress(token, {
            title: checkoutData['address-type'] === 'at-office' ? 'Is Yeri' : 'Ev',
            firstName,
            lastName,
            phone,
            line1: address,
            line2: aptSuite || undefined,
            city,
            district,
            postalCode,
            country: 'TR',
            isDefault: true,
          })

          const addressId = addressRes?.data?.id || addressRes?.id
          if (!addressId) throw new Error(addressRes?.message || 'Adres olusturulamadi')

          const orderRes = await apiCreateOrder(token, {
            addressId,
            couponCode: couponCode || undefined,
            items: buildOrderItems(cartItems),
          })
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

          // KRİTİK: Sepeti burada TEMİZLEME. Ödeme onaylanana kadar ürünler sepette
          // kalmalı — müşteri PayTR'den ödemeden/iptalle dönerse sepeti kaybetmesin.
          // Sepet yalnızca /odeme/basarili sayfasında temizlenir.
          window.location.href = iframeUrl
        } catch (error: any) {
          const msg = String(error?.message || '')
          let userMsg = 'Ödeme başlatılamadı. Lütfen tekrar deneyin.'
          if (/Product not found|product/i.test(msg)) {
            userMsg = 'Sepetinizdeki ürünlerden biri artık satışta değil. Sepeti yenileyip tekrar deneyin.'
          } else if (/kupon|coupon/i.test(msg)) {
            userMsg = msg.replace(/^.*?:/, '').trim() || 'Kupon geçerli değil. Sepetten kuponu kaldırıp tekrar deneyin.'
            onCouponInvalid?.()
          } else if (/unauthorized|401|token/i.test(msg)) {
            userMsg = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.'
            setTimeout(() => { window.location.href = '/login?redirect=/checkout' }, 2000)
          } else if (/network|fetch/i.test(msg)) {
            userMsg = 'Bağlantı hatası. İnternetinizi kontrol edip tekrar deneyin.'
          } else if (msg && !/^TypeError|^undefined/.test(msg)) {
            userMsg = msg
          }
          toast.error(userMsg, { duration: 5000 })
        } finally {
          setSubmitting(false)
        }
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          {/* ── Sipariş Onay Özeti (adım adım) ── */}
          <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-500" />
                  İletişim
                </div>
                <p className="mt-1 truncate text-sm">{[email, phone].filter(Boolean).join(' · ') || <span className="text-red-500">Eksik</span>}</p>
              </div>
              <button type="button" onClick={onEditContact} className="shrink-0 text-sm font-medium underline">Değiştir</button>
            </div>
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-500" />
                  Teslimat Adresi
                </div>
                <p className="mt-1 text-sm">
                  {[`${firstName} ${lastName}`.trim(), address, aptSuite, [district, city].filter(Boolean).join('/')]
                    .filter(Boolean)
                    .join(', ') || <span className="text-red-500">Eksik</span>}
                </p>
              </div>
              <button type="button" onClick={onEditShipping} className="shrink-0 text-sm font-medium underline">Değiştir</button>
            </div>
          </div>

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

            <div className={clsx('mt-4 border-t pt-4', methodActive !== 'Credit-Card' && 'hidden')}>
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Güvenli Ödeme — PayTR</p>
                    <p className="mt-1 text-xs text-blue-800 dark:text-blue-300">
                      "Siparişi Onayla"ya tıkladığınızda, kart bilgilerinizi <strong>PayTR</strong>'nin güvenli 256-bit SSL ödeme sayfasında gireceksiniz. Kart bilgileriniz sitemizde saklanmaz.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="flex h-7 w-11 items-center justify-center rounded border bg-white text-[9px] font-bold text-blue-700">VISA</div>
                      <div className="flex h-7 w-11 items-center justify-center rounded border bg-white"><div className="flex -space-x-1"><div className="h-4 w-4 rounded-full bg-red-500 opacity-80"></div><div className="h-4 w-4 rounded-full bg-yellow-500 opacity-80"></div></div></div>
                      <div className="flex h-7 w-11 items-center justify-center rounded border bg-white text-[8px] font-bold text-blue-900">TROY</div>
                      <div className="flex h-7 items-center rounded border bg-white px-2 text-[9px] font-semibold text-green-700">3D SECURE</div>
                      <div className="flex h-7 items-center rounded border bg-white px-2 text-[9px] font-semibold text-neutral-600">TAKSİT</div>
                    </div>
                  </div>
                </div>
              </div>
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

          <Field>
            <CheckboxField>
              <Checkbox name="termsAccepted" />
              <Label className="text-sm leading-6">
                <span>
                  <Link href="/mesafeli-satis" className="font-medium underline">Mesafeli Satis Sozlesmesi</Link>,{' '}
                  <Link href="/kullanim-kosullari" className="font-medium underline">Kullanim Kosullari</Link> ve{' '}
                  <Link href="/gizlilik-politikasi" className="font-medium underline">Gizlilik Politikasi</Link>'ni okudum ve kabul ediyorum.
                </span>
              </Label>
            </CheckboxField>
          </Field>

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
