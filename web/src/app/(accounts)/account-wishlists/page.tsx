'use client'

import ProductCard from '@/components/ProductCard'
import { useTranslation } from '@/contexts/LanguageContext'
import { adaptProduct } from '@/lib/adapters'
import { HeartAddIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function WishlistsPage() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pureolentia_token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    const loadWishlist = () => {
      fetch(`${API_URL}/users/me/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((res) => {
          // Backend returns { items: [...] } or { data: { items: [...] } }
          const payload = res?.data || res || {}
          const items = payload.items || payload.data || (Array.isArray(payload) ? payload : [])
          if (Array.isArray(items)) {
            const adapted = items
              .filter((w: any) => w.product || w)
              .map((w: any, i: number) => adaptProduct(w.product || w, i))
            setProducts(adapted)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }

    loadWishlist()

    // Listen for wishlist changes from LikeButton — remove item instantly on unlike
    const handleChange = (e: Event) => {
      const { productId, liked } = (e as CustomEvent).detail || {}
      if (liked === false && productId) {
        // Optimistic remove from list — no re-fetch needed
        setProducts((prev) => prev.filter((p) => p.id !== productId))
      } else {
        // Added — re-fetch to pull fresh data
        loadWishlist()
      }
    }
    window.addEventListener('wishlist:changed', handleChange)
    return () => window.removeEventListener('wishlist:changed', handleChange)
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-neutral-400">{t('common.loading', 'Yükleniyor...')}</div>
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold">{t('wishlist.title', 'Favorilerim')}</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          {t('wishlist.subtitle', 'Beğendiğiniz ürünleri buradan takip edebilirsiniz.')}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <HugeiconsIcon icon={HeartAddIcon} size={36} color="currentColor" strokeWidth={1.5} className="text-red-300" />
          </div>
          <h3 className="mt-6 text-lg font-semibold">{t('wishlist.empty_title', 'Henüz favoriniz yok')}</h3>
          <p className="mt-2 max-w-sm text-sm text-neutral-500">
            {t('wishlist.empty_desc', 'Ürün sayfalarında kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.')}
          </p>
          <Link href="/collections/all" className="mt-6 rounded-full bg-primary-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-800">
            {t('wishlist.discover_coffees', 'Kahveleri Keşfet')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} data={product} isLiked />
          ))}
        </div>
      )}
    </div>
  )
}
