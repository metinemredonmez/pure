/**
 * Backend API response → Frontend component format adapters
 */

import productImage1 from '@/images/products/p1.jpg'
import productImage2 from '@/images/products/p2.jpg'
import productImage3 from '@/images/products/p3.jpg'
import productImage4 from '@/images/products/p4.jpg'
import productImage5 from '@/images/products/p5.jpg'
import productImage6 from '@/images/products/p6.jpg'
import productImage7 from '@/images/products/p7.jpg'
import productImage8 from '@/images/products/p8.jpg'

// Backend base URL for images (strips /api from NEXT_PUBLIC_API_URL)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const IMAGE_BASE = API_URL.replace(/\/api\/?$/, '')

/**
 * Resolve image URL - if relative (starts with /), prepend backend base URL
 */
export function resolveImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/uploads/')) return `${IMAGE_BASE}${url}`
  return url
}

const fallbackImages = [
  productImage1, productImage2, productImage3, productImage4,
  productImage5, productImage6, productImage7, productImage8,
]

function getFallbackImage(index: number) {
  const img = fallbackImages[index % fallbackImages.length]
  return { src: img.src, width: img.width, height: img.height, alt: '' }
}

// Roast level colors
const roastColorMap: Record<string, string> = {
  LIGHT: '#D4A574',
  MEDIUM: '#8B6914',
  MEDIUM_DARK: '#5C3D1E',
  DARK: '#2C1810',
}

/**
 * Backend product → Frontend TProductItem format
 */
export function adaptProduct(product: any, index: number = 0) {
  // Build image list from backend ProductImages
  let productImages: any[] = []

  if (product.images?.length) {
    productImages = product.images
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((img: any) => ({
        src: resolveImageUrl(img.url || img.src || ''),
        width: 1200,
        height: 1200,
        alt: img.alt || product.name,
      }))
  }

  // If no images, use fallback
  if (!productImages.length) {
    const fallback = getFallbackImage(index)
    productImages = [fallback, fallback, fallback, fallback]
  }

  // Ensure we have at least 4 images for the gallery
  while (productImages.length < 4) {
    productImages.push(productImages[0])
  }

  // Roast level — only show kavurma options if product actually has roastLevel set
  const roastLevel = product.roastLevel || null
  const kavurmaOptions = roastLevel
    ? [
        { name: 'Acik Kavurma', swatch: { color: roastColorMap.LIGHT, image: null } },
        { name: 'Orta Kavurma', swatch: { color: roastColorMap.MEDIUM, image: null } },
        { name: 'Koyu Kavurma', swatch: { color: roastColorMap.DARK, image: null } },
      ]
    : []

  // Gramaj seçeneği SADECE Filtre Kahve ve Espresso kategorilerinde gösterilir.
  // Türk Kahvesi ve diğer kategorilerde gramaj seçici çıkmaz (sabit paket satılır).
  const GRAMAJ_CATEGORIES = ['filtre-kahve', 'espresso']
  const categorySlug = product.category?.slug || ''

  // Variants → Gramaj options (unique weights, ascending) + her gramajın fiyatı.
  // Bundle products (e.g. "12'li Kutu") have no weight variants and shouldn't show selector.
  const gramajOptions = (() => {
    if (!GRAMAJ_CATEGORIES.includes(categorySlug)) return []
    const variants = product.variants as any[] | undefined
    if (!variants?.length) return []
    const byWeight = new Map<number, any>()
    for (const v of variants) {
      const w = Number(v.weight)
      if (w && !byWeight.has(w)) byWeight.set(w, v)
    }
    const weights = [...byWeight.keys()].sort((a, b) => a - b)
    if (weights.length === 0) return []
    if (weights.length === 1 && variants.length === 1) return [] // single variant = no choice
    return weights.map((w) => {
      const v = byWeight.get(w)
      return {
        name: w >= 1000 ? `${w / 1000}kg` : `${w}g`,
        swatch: null,
        // Fiyatlı gramaj için ek alanlar (buy-box tarafından kullanılır)
        priceAmount: parseFloat(v?.price) || 0,
        variantId: v?.id as string | undefined,
        weight: w,
      }
    })
  })()

  // Öğütme (grind) seçenekleri — varyantlarda birden fazla farklı grindType varsa göster.
  const GRIND_LABELS: Record<string, string> = {
    WHOLE_BEAN: 'Çekirdek', FRENCH_PRESS: 'French Press', V60: 'V60',
    FILTER: 'Filtre', ESPRESSO: 'Espresso', TURKISH: 'Türk Kahvesi',
  }
  const grindOptions = (() => {
    const variants = (product.variants as any[]) || []
    const grinds = [...new Set(variants.map((v) => v.grindType).filter(Boolean))] as string[]
    if (grinds.length < 2) return [] // 0 veya 1 öğütme → seçime gerek yok
    return grinds.map((g) => ({ name: GRIND_LABELS[g] || g, value: g, swatch: null }))
  })()

  // Kavurma seçenekleri — varyantlarda birden fazla farklı roastLevel varsa
  // müşteri SEÇEBİLİR (admin ürün başına hangi kavurmaları girdiyse onlar).
  // Tek/0 kavurmalı üründe seçici çıkmaz, ürünün sabit kavurması bilgi kalır.
  const ROAST_OPT_LABELS: Record<string, string> = {
    LIGHT: 'Açık Kavurma', MEDIUM: 'Orta Kavurma',
    MEDIUM_DARK: 'Orta-Koyu Kavurma', DARK: 'Koyu Kavurma',
  }
  const roastOptions = (() => {
    const variants = (product.variants as any[]) || []
    const roasts = [...new Set(variants.map((v) => v.roastLevel).filter(Boolean))] as string[]
    if (roasts.length < 2) return []
    return roasts.map((r) => ({ name: ROAST_OPT_LABELS[r] || r, value: r, swatch: null }))
  })()

  const roastName =
    roastLevel === 'LIGHT' ? 'Acik Kavurma' :
    roastLevel === 'DARK' ? 'Koyu Kavurma' :
    roastLevel ? 'Orta Kavurma' : ''

  return {
    id: product.id,
    title: product.name,
    handle: product.slug,
    createdAt: product.createdAt,
    vendor: product.origin || 'Pure Olentia',
    price: parseFloat(product.price) || 0,
    featuredImage: productImages[0],
    images: productImages,
    reviewNumber: product.reviewCount || 0,
    rating: product.avgRating || 0,
    status: product.isFeatured ? 'Yeni Mahsul' : product.compareAtPrice ? '%20 Indirim' : '',
    // Only include option groups that actually have values —
    // bundle products (e.g. "12'li Kutu") won't show a gramaj selector.
    // Kavurma: varyantlarda ≥2 farklı kavurma varsa müşteri seçer; yoksa
    // ürünün sabit kavurması bilgi olarak gösterilir (seçici çıkmaz).
    options: [
      ...(roastOptions.length ? [{ name: 'KavurmaSecim', optionValues: roastOptions }] : []),
      ...(grindOptions.length ? [{ name: 'Öğütme', optionValues: grindOptions }] : []),
      ...(gramajOptions.length ? [{ name: 'Gramaj', optionValues: gramajOptions }] : []),
    ],
    selectedOptions: [
      ...(kavurmaOptions.length ? [{ name: 'Kavurma', value: roastName }] : []),
      ...(grindOptions.length ? [{ name: 'Öğütme', value: (grindOptions[0] as any).value }] : []),
      ...(gramajOptions.length ? [{ name: 'Gramaj', value: gramajOptions[0].name }] : []),
    ],
    // Extra coffee fields
    origin: product.origin,
    region: product.region,
    roastLevel: product.roastLevel,
    aromaProfile: product.aromaProfile,
    flavorNotes: product.flavorNotes,
    altitude: product.altitude,
    process: product.process,
    description: product.description,
    shortDescription: product.shortDescription,
    category: product.category,
    variants: product.variants,
  }
}

/**
 * Backend category → Frontend TCollection format
 */
export function adaptCategory(cat: any, index: number = 0) {
  const img = getFallbackImage(index)
  const colors = ['bg-primary-50', 'bg-secondary-50', 'bg-blue-50', 'bg-green-50', 'bg-red-50', 'bg-yellow-50']
  return {
    id: cat.id,
    title: cat.name,
    handle: cat.slug,
    description: cat.description || '',
    sortDescription: cat.description || '',
    color: colors[index % colors.length],
    count: cat._count?.products || 0,
    image: {
      src: cat.image ? resolveImageUrl(cat.image) : img.src,
      width: img.width,
      height: img.height,
      alt: cat.name,
    },
  }
}

/**
 * Backend BlogPost → Frontend TBlogPost format
 */
export function adaptBlogPost(post: any, index: number = 0) {
  const img = getFallbackImage(index)
  const coverSrc = post.coverImage ? resolveImageUrl(post.coverImage) : img.src
  const published = post.publishedAt || post.createdAt
  const dateObj = published ? new Date(published) : new Date()
  const dateStr = dateObj.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  // Rough read time: ~200 words/min from content length
  const wordCount = (post.content || '').split(/\s+/).length
  const readMinutes = Math.max(1, Math.round(wordCount / 200))

  return {
    id: post.id,
    title: post.title,
    handle: post.slug,
    excerpt: post.excerpt || '',
    featuredImage: {
      src: coverSrc,
      alt: post.title || '',
      width: 800,
      height: 533,
    },
    date: dateStr,
    datetime: dateObj.toISOString().slice(0, 10),
    category: {
      title: post.category?.name || 'Blog',
      href: post.category?.slug ? `/blog?category=${post.category.slug}` : '/blog',
    },
    timeToRead: `${readMinutes} dk okuma`,
    author: {
      name: 'Pure Olentia',
      avatar: {
        src: '/icon.png',
        alt: 'Pure Olentia',
        width: 40,
        height: 40,
      },
      description: 'Pure Olentia specialty kahve ekibi.',
    },
  }
}

/**
 * Backend collection → Frontend TCollection format
 */
export function adaptCollection(col: any, index: number = 0) {
  const img = getFallbackImage(index)
  const colors = ['bg-primary-50', 'bg-secondary-50', 'bg-orange-50', 'bg-green-50']
  return {
    id: col.id,
    title: col.name,
    handle: col.slug,
    description: col.description || '',
    sortDescription: col.description || '',
    color: colors[index % colors.length],
    count: col._count?.products || 0,
    image: {
      src: col.image ? resolveImageUrl(col.image) : img.src,
      width: img.width,
      height: img.height,
      alt: col.name,
    },
  }
}
