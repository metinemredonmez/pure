import { Link } from '@/components/Link'
import logoImg from '@/images/logo.png'
import Image from 'next/image'
import React from 'react'

export interface LogoProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className = 'shrink-0', ...props }) => {
  return (
    <Link href="/" className={`flex items-center gap-2 text-neutral-950 dark:text-neutral-50 ${className}`}>
      <Image
        src={logoImg}
        alt="Pure Olentia"
        width={40}
        height={40}
        className="rounded-full"
      />
      <span className="text-xl font-semibold tracking-tight">
        Pure <span className="font-light">Olentia</span>
      </span>
    </Link>
  )
}

export default Logo
