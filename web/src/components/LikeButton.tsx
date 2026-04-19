'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface Props {
  className?: string
  liked?: boolean
  productId?: string
}

const LikeButton: React.FC<Props> = ({ className = '', liked = false, productId }) => {
  const [isLiked, setIsLiked] = useState(liked)
  const [loading, setLoading] = useState(false)

  // On mount, check actual wishlist state if we have a token
  useEffect(() => {
    if (!productId || typeof window === 'undefined') return
    const token = localStorage.getItem('pureolentia_token')
    if (!token) return

    fetch(`${API_URL}/users/me/wishlist/${productId}/check`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        const inWishlist = res?.data?.inWishlist ?? res?.inWishlist ?? res?.data ?? false
        if (typeof inWishlist === 'boolean') setIsLiked(inWishlist)
      })
      .catch(() => {})
  }, [productId])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('pureolentia_token') : null
    if (!token) {
      toast.error('Favorilere eklemek için giriş yapın', { duration: 3000 })
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
      return
    }

    if (!productId) {
      // No product id yet, just toggle locally (home card placeholders etc.)
      setIsLiked(!isLiked)
      return
    }

    setLoading(true)
    const nextLiked = !isLiked
    setIsLiked(nextLiked) // optimistic update

    try {
      const res = await fetch(`${API_URL}/users/me/wishlist/${productId}`, {
        method: nextLiked ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        setIsLiked(!nextLiked) // revert
        const err = await res.json().catch(() => null)
        toast.error(err?.message || 'İşlem başarısız', { duration: 2500 })
      } else {
        toast.success(nextLiked ? 'Favorilere eklendi ♥' : 'Favorilerden kaldırıldı', { duration: 2000 })
        // Notify wishlist page (or anyone listening) to update its list
        window.dispatchEvent(
          new CustomEvent('wishlist:changed', {
            detail: { productId, liked: nextLiked },
          })
        )
      }
    } catch {
      setIsLiked(!nextLiked) // revert
      toast.error('Bağlantı hatası', { duration: 2500 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      aria-label={isLiked ? 'Favorilerden kaldır' : 'Favorilere ekle'}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 nc-shadow-lg disabled:opacity-60 dark:bg-neutral-900 dark:text-neutral-200 ${className}`}
      onClick={handleClick}
      disabled={loading}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path
          d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
          stroke={isLiked ? '#ef4444' : 'currentColor'}
          fill={isLiked ? '#ef4444' : 'none'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default LikeButton
