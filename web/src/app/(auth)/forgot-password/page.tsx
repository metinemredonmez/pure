import Link from 'next/link'
import ForgotPasswordForm from './ForgotPasswordForm'

export const metadata = {
  title: 'Şifremi Unuttum',
  description: 'Pure Olentia şifre sıfırlama sayfası.',
}

const PageForgotPass = () => {
  return (
    <div className="container mb-24 lg:mb-32">
      <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-16 lg:mb-20">
        <h1 className="mt-20 flex items-center justify-center text-3xl leading-[1.15] font-semibold text-neutral-900 md:text-5xl md:leading-[1.15] dark:text-neutral-100">
          Şifremi Unuttum
        </h1>
        <span className="mt-4 block text-sm text-neutral-700 sm:text-base dark:text-neutral-200">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </span>
      </header>

      <div className="mx-auto max-w-md space-y-6">
        <ForgotPasswordForm />

        <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          <Link href="/login" className="text-primary-600 underline">
            Giriş yap
          </Link>
          <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">/</span>
          <Link href="/signup" className="text-primary-600 underline">
            Kayıt ol
          </Link>
        </span>
      </div>
    </div>
  )
}

export default PageForgotPass
