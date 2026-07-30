'use client'

import { useTranslation } from '@/contexts/LanguageContext'
import { getApiBlogComments, submitBlogComment } from '@/lib/api'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Textarea } from '@/shared/textarea'
import { useEffect, useState } from 'react'

type Comment = {
  id: string
  authorName: string
  body: string
  createdAt: string
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function BlogCommentSection({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = (await getApiBlogComments(slug)) as any
      if (cancelled) return
      const list: Comment[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setComments(list)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)

    const name = authorName.trim()
    const text = body.trim()
    if (!name) {
      setMessage({ type: 'error', text: t('blog.error_name', 'Lütfen isim girin.') })
      return
    }
    if (text.length < 2) {
      setMessage({ type: 'error', text: t('blog.error_min_length', 'Yorum en az 2 karakter olmalı.') })
      return
    }

    setSubmitting(true)
    const res = (await submitBlogComment(slug, {
      authorName: name,
      authorEmail: authorEmail.trim() || undefined,
      body: text,
    })) as any
    setSubmitting(false)

    if (res?.success === false || res?.statusCode >= 400) {
      setMessage({ type: 'error', text: res?.message || t('blog.error_send', 'Yorum gönderilemedi.') })
      return
    }

    setAuthorName('')
    setAuthorEmail('')
    setBody('')
    setMessage({
      type: 'success',
      text: res?.message || t('blog.success', 'Yorumunuz alındı, onaylandıktan sonra yayınlanacak.'),
    })
  }

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-md) pt-5">
      <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
        {t('blog.comments', 'Yorumlar')} {comments.length > 0 && <span className="text-neutral-500">({comments.length})</span>}
      </h3>

      <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            name="authorName"
            placeholder={t('blog.name_placeholder', 'İsminiz *')}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={80}
            required
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <input
            type="email"
            name="authorEmail"
            placeholder={t('blog.email_placeholder', 'E-posta (opsiyonel)')}
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <Textarea
          rows={6}
          name="comment"
          placeholder={t('blog.comment_placeholder', 'Yorumunuzu yazın...')}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          required
        />
        {message && (
          <p
            className={`text-sm ${
              message.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {message.text}
          </p>
        )}
        <div>
          <ButtonPrimary type="submit" disabled={submitting}>
            {submitting ? t('form.sending', 'Gönderiliyor...') : t('blog.submit', 'Yorum Gönder')}
          </ButtonPrimary>
        </div>
      </form>

      <div className="mt-10 flex flex-col gap-6">
        {loading ? (
          <p className="text-sm text-neutral-500">{t('blog.loading', 'Yorumlar yükleniyor...')}</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-neutral-500">{t('blog.empty', 'Henüz yorum yok. İlk yorumu siz bırakın.')}</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{c.authorName}</span>
                <span className="text-xs text-neutral-500">{formatDate(c.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm whitespace-pre-line text-neutral-700 dark:text-neutral-300">{c.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
