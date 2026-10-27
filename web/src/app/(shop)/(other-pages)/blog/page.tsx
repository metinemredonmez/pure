import BgGlassmorphism from '@/components/BgGlassmorphism/BgGlassmorphism'
import SectionPromo2 from '@/components/SectionPromo2'
import SectionGridPosts from '@/components/blog/SectionGridPosts'
import SectionMagazine5 from '@/components/blog/SectionMagazine5'
import { getApiBlogPosts } from '@/lib/api'
import { adaptBlogPost } from '@/lib/adapters'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Pure Olentia blog — kahve dünyasından haberler, demleme rehberleri ve menşei hikayeleri.',
}

const BlogPage: React.FC = async () => {
  // Yalnızca backend'deki gerçek yazılar (template demo yazıları yok)
  let blogPosts: any[] = []
  try {
    const res = (await getApiBlogPosts({ limit: 30 })) as any
    const list: any[] = res?.data?.data || res?.data || []
    if (Array.isArray(list) && list.length) {
      blogPosts = list.map((p: any, i: number) => adaptBlogPost(p, i))
    }
  } catch {}


  return (
    <div>
      <BgGlassmorphism />
      <div className="relative container">
        <div className="pt-12 pb-16 lg:pb-28">
          {blogPosts.length > 0 ? (
            <SectionMagazine5 posts={blogPosts} />
          ) : (
            <p className="py-16 text-center text-neutral-500 dark:text-neutral-400">Henüz yayınlanmış yazı yok.</p>
          )}
        </div>
        {blogPosts.length > 0 && <SectionGridPosts posts={blogPosts} className="pb-16 lg:pb-28" />}
        <SectionPromo2 className="pb-16 lg:pb-28" />
      </div>
    </div>
  )
}

export default BlogPage
