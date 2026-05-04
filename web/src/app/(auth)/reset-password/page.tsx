import Link from 'next/link'
import { Suspense } from 'react'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata = {
  title: 'Şifre Sıfırla',
  description: 'Pure Olentia yeni şifre belirleme sayfası.',
}

// useSearchParams() requires dynamic rendering — bypass static prerender
export const dynamic = 'force-dynamic'

const PageResetPassword = () => {
  return (
    <div className="container mb-24 lg:mb-32">
      <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-16 lg:mb-20">
        <h1 className="mt-20 flex items-center justify-center text-3xl leading-[1.15] font-semibold text-neutral-900 md:text-5xl md:leading-[1.15] dark:text-neutral-100">
          Yeni Şifre Belirle
        </h1>
        <span className="mt-4 block text-sm text-neutral-700 sm:text-base dark:text-neutral-200">
          Yeni şifrenizi girin. En az 8 karakter, bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermeli.
        </span>
      </header>

      <div className="mx-auto max-w-md space-y-6">
        <Suspense fallback={<div className="text-center text-sm text-neutral-500">Yükleniyor...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          <Link href="/login" className="text-primary-600 underline">
            Giriş yap
          </Link>
        </span>
      </div>
    </div>
  )
}

export default PageResetPassword
