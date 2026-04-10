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
function resolveImageUrl(url: string): string {
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

  // Roast level
  const roastLevel = product.roastLevel || 'MEDIUM'
  const kavurmaOptions = [
    { name: 'Acik Kavurma', swatch: { color: roastColorMap.LIGHT, image: null } },
    { name: 'Orta Kavurma', swatch: { color: roastColorMap.MEDIUM, image: null } },
    { name: 'Koyu Kavurma', swatch: { color: roastColorMap.DARK, image: null } },
  ]

  // Variants → Gramaj options
  const gramajOptions = product.variants?.length
    ? product.variants.map((v: any) => ({
        name: v.weight ? `${v.weight}g` : v.name,
        swatch: null,
      }))
    : [
        { name: '250g', swatch: null },
        { name: '500g', swatch: null },
        { name: '1kg', swatch: null },
      ]

  const roastName =
    roastLevel === 'LIGHT' ? 'Acik Kavurma' :
    roastLevel === 'DARK' ? 'Koyu Kavurma' :
    'Orta Kavurma'

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
    rating: product.avgRating || 4.5,
    status: product.isFeatured ? 'Yeni Mahsul' : product.compareAtPrice ? '%20 Indirim' : '',
    options: [
      { name: 'Kavurma', optionValues: kavurmaOptions },
      { name: 'Gramaj', optionValues: gramajOptions },
    ],
    selectedOptions: [
      { name: 'Kavurma', value: roastName },
      { name: 'Gramaj', value: gramajOptions[0]?.name || '250g' },
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
