import facebook from '@/images/socials/facebook.svg'
import twitter from '@/images/socials/twitter.svg'
import youtube from '@/images/socials/youtube.svg'
import { getSiteSettings } from '@/lib/site-settings'
import clsx from 'clsx'
import Image from 'next/image'
import { Link } from '../link'

interface SocialsList1Props {
  className?: string
}

const SocialsList1 = async ({ className }: SocialsList1Props) => {
  const settings = await getSiteSettings()

  const socials: { name: string; icon: any; href: string }[] = [
    settings.instagram && { name: 'Instagram', icon: facebook, href: settings.instagram },
    settings.facebook && { name: 'Facebook', icon: facebook, href: settings.facebook },
    settings.youtube && { name: 'Youtube', icon: youtube, href: settings.youtube },
    settings.twitter && { name: 'Twitter', icon: twitter, href: settings.twitter },
  ].filter(Boolean) as { name: string; icon: any; href: string }[]

  if (!socials.length) return null

  return (
    <div className={clsx('flex flex-col gap-y-3', className)}>
      {socials.map((item, index) => (
        <Link
          target="_blank"
          href={item.href}
          className="flex items-center gap-x-2 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
          key={index}
        >
          <Image sizes="40px" className="h-auto w-5 shrink-0" width={40} height={40} src={item.icon} alt={item.name} />
          <span className="text-sm/6">{item.name}</span>
        </Link>
      ))}
    </div>
  )
}

export default SocialsList1
