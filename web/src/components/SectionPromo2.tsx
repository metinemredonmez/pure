import Logo from '@/components/Logo'
import backgroundLineSvg from '@/images/Moon.svg'
import { resolveImageUrl } from '@/lib/adapters'
import { getSiteSettings } from '@/lib/site-settings'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'

import clsx from 'clsx'
import Image from 'next/image'

export interface SectionPromo2Props {
  className?: string
}

const SectionPromo2 = async ({ className }: SectionPromo2Props) => {
  const settings = await getSiteSettings()
  const title = settings.promo2Title || 'Hediye paketi kahve setleri'
  const subtitle =
    settings.promo2Subtitle ||
    'Sevdiklerinize özel kahve deneyimi hediye edin. Taze kavrulmuş, özenle paketlenmiş.'
  const cta = settings.promo2Cta || 'Hediye Setleri'
  const promoImage = settings.promo2Image ? resolveImageUrl(settings.promo2Image) : '/hero/hediye-paketi.jpg'

  return (
    <div className={clsx(className, 'xl:pt-10 2xl:pt-24')}>
      <div className="relative flex flex-col rounded-2xl bg-yellow-50 p-4 pb-0 sm:rounded-[40px] sm:p-5 sm:pb-0 lg:flex-row lg:justify-end lg:p-14 xl:px-20 xl:py-24 2xl:py-32 dark:bg-neutral-800">
        <div className="absolute inset-5">
          <Image fill className="object-contain dark:opacity-5" src={backgroundLineSvg} alt="backgroundLineSvg" />
        </div>

        <div className="relative max-w-lg lg:w-[45%]">
          <Logo className="w-28" />
          <h2 className="mt-6 text-3xl leading-[1.13]! font-semibold tracking-tight sm:mt-10 sm:text-4xl xl:text-5xl 2xl:text-6xl">
            {title}
          </h2>
          <span className="mt-6 block text-neutral-500 dark:text-neutral-400">{subtitle}</span>
          <div className="mt-6 flex space-x-2 sm:mt-12 sm:space-x-5">
            <ButtonPrimary href="/kurumsal-hediye">{cta}</ButtonPrimary>
          </div>
        </div>

        <div className="relative mt-10 block aspect-square w-full max-w-xl overflow-hidden rounded-2xl lg:absolute lg:top-10 lg:bottom-10 lg:left-10 lg:mt-0 lg:aspect-auto lg:w-[calc(50%-40px)] lg:max-w-none">
          <Image
            alt="Hediye paketi kahve setleri"
            src={promoImage}
            fill
            unoptimized={promoImage.startsWith('http') || promoImage.startsWith('/uploads')}
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default SectionPromo2
