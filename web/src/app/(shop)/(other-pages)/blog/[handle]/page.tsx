import { Divider } from '@/components/Divider'
import BlogCommentSection from '@/components/blog/BlogCommentSection'
import PostCard1 from '@/components/blog/PostCard1'
import { adaptBlogPost } from '@/lib/adapters'
import { getApiBlogPostBySlug, getApiBlogPosts } from '@/lib/api'
import Avatar from '@/shared/Avatar/Avatar'
import SocialsList from '@/shared/SocialsList/SocialsList'
import Tag from '@/shared/Tag'
import { Badge } from '@/shared/badge'
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

async function fetchPostFromBackend(slug: string) {
  try {
    const res = (await getApiBlogPostBySlug(slug)) as any
    const data = res?.data || res
    if (data && data.id) {
      const adapted = adaptBlogPost(data, 0) as any
      adapted.content = data.content || ''
      adapted.tags = Array.isArray(data.tags) ? data.tags : []
      return adapted
    }
  } catch {}
  return null
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const post = await fetchPostFromBackend(handle)
  if (!post) {
    return {
      title: 'Blog',
      description: 'Pure Olentia blog — kahve rehberleri, demleme teknikleri ve menşei hikayeleri.',
    }
  }
  const { title, excerpt } = post
  return { title, description: excerpt }
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  // Yalnızca gerçek yazı: bulunamazsa 404 (önceden her bilinmeyen adreste demo yazı #0 çıkıyordu)
  const post = await fetchPostFromBackend(handle)
  if (!post?.id) {
    return notFound()
  }
  const { featuredImage, id, author, content, date, title, timeToRead, category, excerpt, tags } = post as any

  // Related posts from backend, fall back to static
  let relatedPosts: any[] = []
  try {
    const res = (await getApiBlogPosts({ limit: 4 })) as any
    const list: any[] = res?.data?.data || res?.data || []
    if (Array.isArray(list) && list.length) {
      relatedPosts = list
        .filter((p: any) => p.slug !== handle)
        .slice(0, 4)
        .map((p: any, i: number) => adaptBlogPost(p, i))
    }
  } catch {}

  const renderHeader = () => {
    return (
      <header className="container rounded-xl">
        <div className="mx-auto flex w-full max-w-(--breakpoint-md) flex-col items-start gap-y-5">
          {category?.title && <Badge color="blue">{category.title}</Badge>}
          <h1
            className="max-w-4xl text-3xl font-semibold text-neutral-900 md:text-4xl md:leading-[120%]! lg:text-4xl dark:text-neutral-100"
          >
            {title}
          </h1>
          <span className="block pb-1 text-base text-neutral-500 md:text-lg dark:text-neutral-400">{excerpt}</span>

          <Divider />
          <div className="flex w-full flex-wrap justify-between gap-2.5">
            <div className="nc-PostMeta2 flex shrink-0 flex-wrap items-center text-left text-sm leading-none text-neutral-700 dark:text-neutral-200">
              <Avatar imgUrl={author?.avatar.src} containerClassName="shrink-0" sizeClass="w-8 h-8 sm:h-11 sm:w-11 " />
              <div className="ml-3">
                <div className="flex items-center">
                  <a className="block font-semibold" href="##">
                    {author?.name}
                  </a>
                </div>
                <div className="mt-[6px] text-xs">
                  <span className="text-neutral-700 dark:text-neutral-300">{date}</span>
                  <span className="mx-2 font-semibold">·</span>
                  <span className="text-neutral-700 dark:text-neutral-300">{timeToRead} </span>
                </div>
              </div>
            </div>
            <div className="ms-auto mt-3 sm:mt-1.5">
              <SocialsList />
            </div>
          </div>
        </div>
      </header>
    )
  }

  const renderContent = () => {
    return (
      <div
        id="single-entry-content"
        className="mx-auto prose prose-sm max-w-(--breakpoint-md)! sm:prose lg:prose-lg dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    )
  }

  const renderTags = () => {
    const tagList: string[] = Array.isArray(tags) ? tags : []
    if (!tagList.length) return null
    return (
      <div className="mx-auto flex w-full max-w-(--breakpoint-md) flex-wrap gap-2">
        {tagList.map((tag: string) => (
          <Tag key={tag} className="mb-2">
            {tag}
          </Tag>
        ))}
      </div>
    )
  }

  const renderAuthor = () => {
    return (
      <div className="mx-auto w-full max-w-(--breakpoint-md)">
        <div className="nc-SingleAuthor flex">
          <Avatar imgUrl={author?.avatar.src} sizeClass="w-11 h-11 md:w-24 md:h-24" />
          <div className="ml-3 flex max-w-lg flex-col gap-y-1 sm:ml-5">
            <span className="text-xs tracking-wider text-neutral-400 uppercase">Yazar</span>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200">
              <a href="#">{author?.name}</a>
            </h2>
            <span className="text-sm text-neutral-500 sm:text-base dark:text-neutral-300">{author?.description}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderRelatedPosts = () => {
    if (!relatedPosts.length) return null
    return (
      <div className="mt-16 bg-neutral-100 py-16 lg:mt-24 lg:py-24 dark:bg-neutral-800">
        <div className="container">
          <h2 className="text-3xl font-semibold">İlgili Yazılar</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {relatedPosts.map((post) => (
              <PostCard1 size="sm" key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-8 lg:pt-16">
      {renderHeader()}

      <div className="container my-10 sm:my-12">
        {featuredImage?.src && (
          <Image
            alt={title || ''}
            src={featuredImage?.src}
            width={featuredImage?.width}
            height={featuredImage?.height}
            className="rounded-xl"
          />
        )}
      </div>

      <div className="container flex flex-col gap-y-10">
        {renderContent()}
        {renderTags()}
        <div className="mx-auto w-full max-w-(--breakpoint-md) border-t border-b border-neutral-100 dark:border-neutral-700"></div>
        {renderAuthor()}
        <BlogCommentSection slug={handle} />
      </div>

      {renderRelatedPosts()}
    </div>
  )
}
