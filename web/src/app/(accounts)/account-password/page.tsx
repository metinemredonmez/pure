import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import Form from 'next/form'

export const metadata = {
  title: 'Hesap - Password',
  description: 'Hesap - Password page',
}

const Page = () => {
  const handleSubmit = async (formData: FormData) => {
    'use server'
    const formObject = Object.fromEntries(formData.entries())
    console.log(formObject)
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <div>
        <h1 className="text-2xl font-semibold">Update your password</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">Update your password to keep your account secure.</p>
      </div>

      <Form action={handleSubmit}>
        <Fieldset>
          <FieldGroup className="max-w-xl">
            <Field>
              <Label>Mevcut Şifre</Label>
              <Input type="password" name="current-password" />
            </Field>
            <Field>
              <Label>Yeni Şifre</Label>
              <Input type="password" name="new-password" />
            </Field>
            <Field>
              <Label>Şifreyi Onayla</Label>
              <Input type="password" name="confirm-password" />
            </Field>
            <div className="pt-2">
              <ButtonPrimary>Şifreyi Güncelle</ButtonPrimary>
            </div>
          </FieldGroup>
        </Fieldset>
      </Form>
    </div>
  )
}

export default Page
