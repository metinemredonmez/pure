import { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Giriş Yap',
  description: 'Pure Olentia hesabınıza giriş yapın.',
}

export default function PageLogin() {
  return (
    <div>
      <div className="container mb-24 lg:mb-32">
        <h1 className="my-20 flex items-center justify-center text-3xl leading-[115%] font-semibold text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
          Giriş Yap
        </h1>
        <div className="mx-auto flex max-w-md flex-col gap-y-6">
          <LoginForm />

          <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
            Hesabınız yok mu?{' '}
            <Link className="text-primary-600 underline" href="/signup">
              Hesap oluşturun
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
