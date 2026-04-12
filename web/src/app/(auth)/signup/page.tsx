import Logo from '@/components/Logo'
import { Metadata } from 'next'
import Link from 'next/link'
import SignupForm from './SignupForm'

export const metadata: Metadata = {
  title: 'Kayıt Ol',
  description: 'Pure Olentia hesabı oluşturun.',
}

export default function PageSignUp() {
  return (
    <div className="container mb-24 lg:mb-32">
      <div className="flex justify-center pt-10">
        <Link href="/">
          <Logo className="w-32" />
        </Link>
      </div>
      <h1 className="my-12 flex items-center justify-center text-3xl leading-[115%] font-semibold text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
        Hesap Oluştur
      </h1>
      <div className="mx-auto max-w-md space-y-6">
        <SignupForm />

        <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          Zaten hesabınız var mı?{' '}
          <Link className="text-primary-600 underline" href="/login">
            Giriş yapın
          </Link>
        </span>

        <Link href="/" className="block text-center text-sm text-neutral-500 hover:text-primary-600">
          ← Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
