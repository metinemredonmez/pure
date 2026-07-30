'use client'

import ReviewItem from '@/components/ReviewItem'
import StarReview from '@/components/StarReview'
import { useTranslation } from '@/contexts/LanguageContext'
import { TReview } from '@/data/data'
import { getApiProductReviews, submitProductReview } from '@/lib/api'
import { Button } from '@/shared/Button/Button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/shared/dialog'
import { Field, Fieldset, Label } from '@/shared/fieldset'
import { Textarea } from '@/shared/textarea'
import { StarIcon } from '@heroicons/react/24/solid'
import { MessageAdd01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'

type Props = {
  productId?: string
  reviews: TReview[]
  className?: string
  rating: number
  reviewNumber: number
}

function mapReviews(raw: any[]): TReview[] {
  return raw.map((r: any, i: number) => ({
    id: r.id || String(i),
    title: r.title || '',
    rating: r.rating || 5,
    content: r.content || r.comment || '',
    author: r.author?.name || r.user?.firstName || 'Müşteri',
    authorAvatar: undefined as any,
    date: r.createdAt
      ? new Date(r.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
      : '',
    datetime: r.createdAt || '',
  }))
}

const ProductReviews = ({ productId, rating, reviewNumber, reviews: initialReviews, className }: Props) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = React.useState(false)
  const [rating_, setRating] = React.useState(0)
  const [title, setTitle] = React.useState('')
  const [comment, setComment] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [reviews, setReviews] = React.useState<TReview[]>(initialReviews || [])
  const [reviewCount, setReviewCount] = React.useState(reviewNumber)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('pureolentia_token'))
    }
  }, [isOpen])

  const refreshReviews = React.useCallback(async () => {
    if (!productId) return
    const res = (await getApiProductReviews(productId)) as any
    const revData = res?.data?.data || res?.data || []
    if (Array.isArray(revData)) {
      const mapped = mapReviews(revData)
      setReviews(mapped)
      setReviewCount(mapped.length)
    }
  }, [productId])

  const resetForm = () => {
    setRating(0)
    setTitle('')
    setComment('')
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    if (!productId) {
      setMessage({ type: 'error', text: t('reviews.error_no_product', 'Ürün bilgisi alınamadı, lütfen sayfayı yenileyin.') })
      return
    }
    if (rating_ < 1 || rating_ > 5) {
      setMessage({ type: 'error', text: t('reviews.error_rating_range', 'Lütfen 1-5 arası puan verin.') })
      return
    }
    const body = comment.trim()
    if (body.length < 2) {
      setMessage({ type: 'error', text: t('reviews.error_min_length', 'Yorum en az 2 karakter olmalı.') })
      return
    }

    setSubmitting(true)
    const res = (await submitProductReview(productId, {
      rating: rating_,
      title: title.trim() || undefined,
      comment: body,
    })) as any
    setSubmitting(false)

    if (res?.success === false || res?.statusCode >= 400) {
      setMessage({ type: 'error', text: res?.message || t('reviews.error_submit_failed', 'Yorum gönderilemedi.') })
      return
    }

    resetForm()
    await refreshReviews()
    setMessage({ type: 'success', text: t('reviews.success_submitted', 'Yorumunuz alındı, teşekkürler!') })
    setTimeout(() => {
      setIsOpen(false)
      setMessage(null)
    }, 1500)
  }

  return (
    <div className={clsx(className)}>
      <div>
        <h2 className="flex scroll-mt-8 items-center text-2xl font-semibold" id="reviews">
          <StarIcon className="mb-0.5 size-7" />
          <span className="ml-1.5">
            {rating} · {t('reviews.review_count', '{count} Yorum', { count: reviewCount })}
          </span>
        </h2>

        {reviews.length > 0 ? (
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-x-14 gap-y-11 md:grid-cols-2 lg:gap-x-28">
              {reviews.map((review) => (
                <ReviewItem key={review.id} data={review} />
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-neutral-500">{t('reviews.empty', 'Henüz yorum yok. İlk yorumu siz yazın.')}</p>
        )}

        <Button className="mt-10" onClick={() => setIsOpen(true)}>
          <HugeiconsIcon icon={MessageAdd01Icon} size={20} />
          {t('reviews.write_review', 'Yorum yaz')}
        </Button>

        <Dialog size="2xl" open={isOpen} onClose={setIsOpen}>
          <DialogTitle>
            <div className="flex items-center">
              <HugeiconsIcon icon={MessageAdd01Icon} size={20} className="mr-2" />
              {t('reviews.write_review', 'Yorum yaz')}
            </div>
          </DialogTitle>
          <DialogDescription>
            {t('reviews.email_not_published', 'E-posta adresiniz yayınlanmaz. Zorunlu alanlar yıldız (*) ile işaretlidir.')}
          </DialogDescription>
          <DialogBody>
            {!isLoggedIn ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900">
                <p className="text-neutral-700 dark:text-neutral-200">
                  {t('reviews.login_prompt_before', 'Yorum yapabilmek için')}{' '}
                  <Link href="/login" className="font-semibold underline">
                    {t('reviews.login_prompt_link', 'giriş yapmalısınız')}
                  </Link>
                  {t('reviews.login_prompt_middle', '. Hesabınız yoksa')}{' '}
                  <Link href="/signup" className="font-semibold underline">
                    {t('reviews.login_prompt_here', 'buradan')}
                  </Link>{' '}
                  {t('reviews.login_prompt_after', 'oluşturabilirsiniz.')}
                </p>
              </div>
            ) : (
              <form id="review-form" onSubmit={handleSubmit}>
                <Fieldset>
                  <Field>
                    <Label>{t('reviews.label_rating', 'Puan *')}</Label>
                    <StarReview onRatingChange={setRating} initialRating={rating_} />
                  </Field>
                  <Field className="mt-5">
                    <Label>{t('reviews.label_title', 'Başlık')}</Label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={120}
                      className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </Field>
                  <Field className="mt-5">
                    <Label>{t('reviews.label_comment', 'Yorumunuz *')}</Label>
                    <Textarea
                      name="comment"
                      placeholder=""
                      rows={6}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={2000}
                    />
                  </Field>
                </Fieldset>
                {message && (
                  <p
                    className={`mt-3 text-sm ${
                      message.type === 'success'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {message.text}
                  </p>
                )}
              </form>
            )}
          </DialogBody>
          <DialogActions>
            <Button size="smaller" plain onClick={() => setIsOpen(false)}>
              {isLoggedIn ? t('common.cancel', 'İptal') : t('common.close', 'Kapat')}
            </Button>
            {isLoggedIn && (
              <Button size="smaller" type="submit" form="review-form" disabled={submitting}>
                {submitting ? t('reviews.submitting', 'Gönderiliyor...') : t('reviews.submit_review', 'Yorumu Gönder')}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

export default ProductReviews
