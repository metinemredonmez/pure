'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonThird from '@/shared/Button/ButtonThird'
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
  Wallet03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react'
import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'

type Tab = 'ContactInfo' | 'ShippingAddress' | 'PaymentMethod'

const Information = () => {
  const [tabActive, setTabActive] = useState<Tab>('ShippingAddress')

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
          title="Contact information"
          icon={UserCircle02Icon}
          value="Enrico Smith / +855-666-7744"
          onClickChange={() => {
            setTabActive('ContactInfo')
            handleScrollToEl('ContactInfo')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'ContactInfo' && 'invisible hidden')}>
          <ContactInfo
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
          value="St. Paul's Road, Norris, SD 57560, Dakota, USA"
          onClickChange={() => {
            setTabActive('ShippingAddress')
            handleScrollToEl('ShippingAddress')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'ShippingAddress' && 'invisible hidden')}>
          <ShippingAddress
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
          value="Kredi Kartı / xxx-xxx-xx55"
          onClickChange={() => {
            setTabActive('PaymentMethod')
            handleScrollToEl('PaymentMethod')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'PaymentMethod' && 'invisible hidden')}>
          <PaymentMethod
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
        Change
      </button>
    </div>
  )
}

const ContactInfo = ({ onClose }: { onClose: () => void }) => {
  return (
    <form
      action="#"
      method="POST"
      onSubmit={(e) => {
        e.preventDefault()
        const formValues = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        console.log(formValues)
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
            <Input defaultValue={'+808 xxx'} type="tel" name="phone" />
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
              Cancel
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

const ShippingAddress = ({ onClose }: { onClose: () => void }) => {
  return (
    <form
      action="#"
      method="POST"
      onSubmit={(e) => {
        e.preventDefault()
        const formValues = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        console.log(formValues)
        onClose()
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
            <Field>
              <Label>Ad</Label>
              <Input defaultValue="Cole" name="first-name" />
            </Field>
            <Field>
              <Label>Soyad</Label>
              <Input defaultValue="Enrico" name="last-name" />
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
              Cancel
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

const PaymentMethod = ({ onClose }: { onClose: () => void }) => {
  const [mothodActive, setMethodActive] = useState<'Credit-Card' | 'Internet-banking' | 'Wallet'>('Credit-Card')

  const renderDebitCredit = () => {
    const active = mothodActive === 'Credit-Card'
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          onChange={(e) => setMethodActive(e as any)}
          value={mothodActive}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="Credit-Card" defaultChecked={active} />
            <Label className="flex items-center gap-x-4 sm:gap-x-6">
              <div
                className={clsx(
                  'rounded-xl border-2 border-neutral-600 p-2.5 dark:border-neutral-300',
                  active ? 'opacity-100' : 'opacity-25'
                )}
              >
                <HugeiconsIcon icon={CreditCardIcon} size={24} />
              </div>
              <p className="font-medium sm:text-base">Banka / Kredi Kartı</p>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('space-y-5 py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <Field className="max-w-lg">
            <Label>Kart Numarası</Label>
            <Input autoComplete="off" name="card-number" />
          </Field>
          <Field className="max-w-lg">
            <Label>Kart Üzerindeki İsim</Label>
            <Input autoComplete="off" name="name-on-card" />
          </Field>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Field className="flex-2/3">
              <Label>Son Kullanma Tarihi (AA/YY)</Label>
              <Input autoComplete="off" placeholder="MM/YY" name="expiration-date" />
            </Field>
            <Field className="flex-1/3">
              <Label>CVC</Label>
              <Input autoComplete="off" placeholder="CVC" name="cvc" />
            </Field>
          </div>
        </div>
      </div>
    )
  }

  const renderInterNetBanking = () => {
    const active = mothodActive === 'Internet-banking'
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          onChange={(e) => setMethodActive(e as any)}
          value={mothodActive}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="Internet-banking" defaultChecked={active} />
            <Label className="flex items-center gap-x-4 sm:gap-x-6">
              <div
                className={clsx(
                  'rounded-xl border-2 border-neutral-600 p-2.5 dark:border-neutral-300',
                  active ? 'opacity-100' : 'opacity-25'
                )}
              >
                <HugeiconsIcon icon={InternetIcon} size={24} />
              </div>
              <p className="font-medium sm:text-base">İnternet Bankacılığı</p>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <Subheading>Havale yaptıktan sonra siparişiniz işleme alınacaktır.</Subheading>
          <DescriptionList className="mt-3.5">
            <DescriptionTerm>Müşteri</DescriptionTerm>
            <DescriptionDetails>Pure Olentia</DescriptionDetails>

            <DescriptionTerm>Banka Adı</DescriptionTerm>
            <DescriptionDetails>İş Bankası</DescriptionDetails>

            <DescriptionTerm>Hesap Numarası</DescriptionTerm>
            <DescriptionDetails>555 888 777</DescriptionDetails>

            <DescriptionTerm>Şube Kodu</DescriptionTerm>
            <DescriptionDetails>999</DescriptionDetails>

            <DescriptionTerm>IBAN</DescriptionTerm>
            <DescriptionDetails>IBAN</DescriptionDetails>

            <DescriptionTerm>BIC</DescriptionTerm>
            <DescriptionDetails>BIC/Swift</DescriptionDetails>
          </DescriptionList>
        </div>
      </div>
    )
  }

  const renderWallet = () => {
    const active = mothodActive === 'Wallet'
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          value={mothodActive}
          onChange={(e) => setMethodActive(e as any)}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="Wallet" defaultChecked={active} />
            <Label className="flex items-center gap-x-4 sm:gap-x-6">
              <div
                className={clsx(
                  'rounded-xl border-2 border-neutral-600 p-2.5 dark:border-neutral-300',
                  active ? 'opacity-100' : 'opacity-25'
                )}
              >
                <HugeiconsIcon icon={Wallet03Icon} size={24} />
              </div>
              <p className="font-medium sm:text-base">Google / Apple Wallet</p>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            Mobil cüzdanınızla hızlı ve güvenli ödeme yapın.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      action="#"
      method="POST"
      onSubmit={(e) => {
        e.preventDefault()
        const formValues = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        console.log(formValues)
        onClose()
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          {renderDebitCredit()}
          {renderInterNetBanking()}
          {renderWallet()}

          <div className="flex flex-wrap gap-2.5 pt-4">
            <ButtonPrimary className="min-w-56" type="submit">
              Siparisi onayla
            </ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              Back to shipping address
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

export default Information
