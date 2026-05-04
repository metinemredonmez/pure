import Logo from '@/components/Logo'
import rightLargeImgDark from '@/images/promo1-dark.png'
import rightImgDemo from '@/images/promo1.png'
import { resolveImageUrl } from '@/lib/adapters'
import { getSiteSettings } from '@/lib/site-settings'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import NcImage from '@/shared/NcImage/NcImage'

interface SectionPromo1Props {
  className?: string
}

const SectionPromo1 = async ({ className = '' }: SectionPromo1Props) => {
  const settings = await getSiteSettings()
  const title = settings.promo1Title || 'Taze kavurma, hızlı teslimat.'
  const subtitle =
    settings.promo1Subtitle || 'Pure Olentia ile ücretsiz kargo ve abonelik indirimi fırsatı.'
  const cta = settings.promo1Cta || 'Kahveleri İncele'
  const customImage = settings.promo1Image ? resolveImageUrl(settings.promo1Image) : ''
  const primaryUrl = settings.promo1PrimaryUrl || '/collections/all'
  const secondaryUrl = settings.promo1SecondaryUrl || '/subscription'

  return (
    <div className={`relative flex flex-col items-center lg:flex-row ${className}`}>
      <div className="relative mb-16 shrink-0 lg:mr-10 lg:mb-0 lg:w-2/5">
        <Logo className="w-28" />
        <h2 className="mt-6 text-3xl leading-[1.2]! font-semibold tracking-tight sm:mt-10 sm:text-4xl xl:text-5xl 2xl:text-6xl">
          {title}
        </h2>
        <span className="mt-6 block text-neutral-500 dark:text-neutral-400">{subtitle}</span>
        <div className="mt-6 flex flex-wrap gap-2 sm:mt-12 sm:gap-x-5">
          <ButtonPrimary href={primaryUrl}>{cta}</ButtonPrimary>
          <ButtonSecondary href={secondaryUrl} className="border border-neutral-100 dark:border-neutral-700">
            Abonelik Planları
          </ButtonSecondary>
        </div>
      </div>
      <div className="relative max-w-xl flex-1 lg:max-w-none">
        {customImage ? (
          <img
            alt=""
            src={customImage}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-full rounded-2xl object-cover"
          />
        ) : (
          <>
            <NcImage
              alt=""
              containerClassName="block dark:hidden"
              src={rightImgDemo}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-2xl"
            />
            <NcImage
              alt=""
              containerClassName="hidden dark:block"
              src={rightLargeImgDark}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-2xl"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default SectionPromo1
