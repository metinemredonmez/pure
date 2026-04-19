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

  // Variants → Gramaj options (unique weights, ascending)
  // Only show gramaj selector if product actually has variants with different weights.
  // Bundle products (e.g. "12'li Kutu") have no weight variants and shouldn't show selector.
  const gramajOptions = (() => {
    const variants = product.variants as any[] | undefined
    if (!variants?.length) return []
    const weights = [...new Set(variants.map((v) => v.weight).filter(Boolean))].sort(
      (a: any, b: any) => Number(a) - Number(b)
    )
    if (weights.length === 0) return []
    if (weights.length === 1 && variants.length === 1) return [] // single variant = no choice
    return weights.map((w: any) => ({
      name: Number(w) >= 1000 ? `${Number(w) / 1000}kg` : `${w}g`,
      swatch: null,
    }))
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
    options: [
      ...(kavurmaOptions.length ? [{ name: 'Kavurma', optionValues: kavurmaOptions }] : []),
      ...(gramajOptions.length ? [{ name: 'Gramaj', optionValues: gramajOptions }] : []),
    ],
    selectedOptions: [
      ...(kavurmaOptions.length ? [{ name: 'Kavurma', value: roastName }] : []),
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
