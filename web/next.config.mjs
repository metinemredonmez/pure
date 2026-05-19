/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 2678400 * 12, // 12 months
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.pureolentia.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pureolentia.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // Türkçe karakterli eski URL'ler → ASCII slug (bookmark/cache uyumu)
      { source: '/çerez-politikasi', destination: '/cerez-politikasi', permanent: true },
      { source: '/%C3%A7erez-politikasi', destination: '/cerez-politikasi', permanent: true },
      { source: '/kullanım-kosullari', destination: '/kullanim-kosullari', permanent: true },
      { source: '/kullan%C4%B1m-kosullari', destination: '/kullanim-kosullari', permanent: true },
      { source: '/sürdürülebilirlik', destination: '/surdurulebilirlik', permanent: true },
      { source: '/menşeiler', destination: '/menseiler', permanent: true },
      { source: '/kahve-sözlüğü', destination: '/kahve-sozlugu', permanent: true },
      { source: '/iade-değişim', destination: '/iade-degisim', permanent: true },
      { source: '/sipariş-takibi', destination: '/siparis-takibi', permanent: true },
      { source: '/ödeme-teslimat', destination: '/odeme-teslimat', permanent: true },
      { source: '/toptan-satış', destination: '/toptan-satis', permanent: true },
      // Silinmiş Velora dummy ürünleri → /collections/all (301 — Google index'den
      // de kademeli olarak kaldırır, kullanıcı hiç 404 görmez)
      { source: '/products/brazil-santos', destination: '/collections/all', permanent: true },
      { source: '/products/brazil-vila-boa', destination: '/collections/all', permanent: true },
      { source: '/products/brazil-vila-boa-espresso-cekirdek', destination: '/collections/all', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Next.js hashed static assets — safe to cache forever
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // HTML pages — always revalidate
        source: '/((?!_next|api).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig
