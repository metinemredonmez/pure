'use client'

import ButtonCircle from '@/shared/Button/ButtonCircle'
import { Input } from '@/shared/input'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import { useRef, useState } from 'react'
import { useTranslation } from '@/contexts/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function NewsletterForm() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')

    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '').trim()

    if (!email) {
      setStatus('error')
      return
    }

    try {
      const res = await fetch(`${API_URL}/public/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'web-footer' }),
      })

      if (res.ok) {
        setStatus('success')
        formRef.current?.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-10 max-w-sm rounded-full bg-emerald-100 px-6 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
        {t('newsletter.success', '✓ Bülten aboneliğiniz oluşturuldu!')}
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative mt-10 max-w-sm">
      <Input
        required
        aria-required
        placeholder={t('newsletter.email_placeholder', 'E-posta adresiniz')}
        type="email"
        name="email"
        className="sm:before:shadow-none"
        disabled={status === 'loading'}
      />
      <ButtonCircle type="submit" className="absolute top-1/2 right-1 -translate-y-1/2 transform" disabled={status === 'loading'}>
        <ArrowRightIcon className="size-4" />
      </ButtonCircle>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-500">{t('newsletter.error', 'Bir hata oluştu, tekrar deneyin.')}</p>
      )}
    </form>
  )
}
