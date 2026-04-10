import backgroundLineSvg from '@/images/BackgroundLine.svg'
import rightImgDemo from '@/images/promo3.png'
import ButtonCircle from '@/shared/Button/ButtonCircle'
import NcImage from '@/shared/NcImage/NcImage'
import { Badge } from '@/shared/badge'
import { Input } from '@/shared/input'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import Image from 'next/image'
import { FC } from 'react'

export interface SectionPromo3Props {
  className?: string
}

const SectionPromo3: FC<SectionPromo3Props> = ({ className }) => {
  return (
    <div className={clsx(className)}>
      <div className="relative flex flex-col rounded-2xl bg-neutral-50 p-6 sm:rounded-[40px] sm:p-8 lg:flex-row lg:p-12 xl:px-16 xl:py-14 dark:bg-neutral-800">
        <div className="absolute inset-10">
          <Image
            fill
            className="absolute h-full w-full object-contain object-bottom dark:opacity-5"
            src={backgroundLineSvg}
            alt="backgroundLineSvg"
          />
        </div>

        <div className="relative max-w-lg lg:w-1/2">
          <h2 className="text-4xl leading-[1.15] font-semibold md:text-5xl">
            Fırsatları <br /> kaçırmayın.
          </h2>
          <p className="mt-7 block text-neutral-500 dark:text-neutral-400">
            Yeni mahsul kahveler, özel indirimler <br /> ve kahve dünyasından haberler.
          </p>
          <ul className="mt-10 flex flex-col gap-y-4">
            <li className="flex items-center gap-x-4">
              <Badge color="violet">01</Badge>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Yeni mahsul bildirimleri</span>
            </li>
            <li className="flex items-center gap-x-4">
              <Badge color="green">02</Badge>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Ücretsiz kargo fırsatları</span>
            </li>
            <li className="flex items-center gap-x-4">
              <Badge color="red">03</Badge>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Abonelere özel indirimler</span>
            </li>
          </ul>
          <form className="relative mt-10 max-w-sm">
            <Input
              required
              aria-required
              placeholder="E-posta adresiniz"
              type="email"
              name="email"
              className="sm:before:shadow-none"
            />
            <ButtonCircle type="submit" className="absolute top-1/2 right-1 -translate-y-1/2 transform">
              <ArrowRightIcon className="size-4" />
            </ButtonCircle>
          </form>
        </div>

        <NcImage
          alt="right hero"
          containerClassName="relative block lg:absolute lg:right-0 lg:bottom-0 mt-10 lg:mt-0 max-w-lg lg:max-w-[calc(50%-40px)]"
          src={rightImgDemo}
          sizes="(max-width: 768px) 100vw, 50vw"
          className=""
        />
      </div>
    </div>
  )
}

export default SectionPromo3
