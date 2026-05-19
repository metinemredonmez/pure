'use client'

import { Button } from '@/shared/Button/Button'
import ButtonClose from '@/shared/Button/ButtonClose'
import { CloseButton, Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { Squares2X2Icon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

const EmblaCarousel = ({ images, option }: { images: string[]; option: EmblaOptionsType }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    ...option,
    direction: 'ltr',
  })
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    ...option,
    containScroll: 'keepSnaps',
    dragFree: true,
    direction: 'ltr',
  })

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi, emblaThumbsApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return
    setSelectedIndex(emblaMainApi.selectedScrollSnap())
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap())
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex])

  useEffect(() => {
    if (!emblaMainApi) return
    onSelect()

    emblaMainApi.on('select', onSelect).on('reInit', onSelect)
  }, [emblaMainApi, onSelect])

  return (
    <div className="relative size-full embla">
      <div className="embla__viewport relative mx-auto size-full overflow-hidden" ref={emblaMainRef}>
        <div className="embla__container size-full">
          {images.map((image, index) => (
            <div className="relative z-50 flex embla__slide basis-full items-center justify-center" key={index}>
              <Image
                alt="Slide image"
                src={image}
                width={1280}
                height={853}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute top-2.5 right-2.5 z-50 sm:top-4 sm:right-4">
            <CloseButton as={ButtonClose}>
              <span className="sr-only">Close</span>
            </CloseButton>
          </div>
        </div>
      </div>

      <div className="embla-thumbs fixed inset-x-0 bottom-5 z-10">
        <div className="embla-thumbs__viewport mx-auto max-w-28" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container flex">
            {images.map((image, index) => (
              <div
                key={index}
                className={clsx(
                  'relative flex aspect-5/3 w-24 shrink-0 items-center justify-center transition-[transform,filter] duration-300 ease-in-out',
                  index === selectedIndex
                    ? 'z-10 scale-125 overflow-hidden rounded-md brightness-100'
                    : 'brightness-50 hover:brightness-95'
                )}
                onClick={() => onThumbClick(index)}
              >
                <Image alt="Slide image" src={image} fill sizes="100px" className={'object-cover'} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface Props {
  images: string[]
  gridType?: 'grid1' | 'grid2' | 'grid3' | 'grid4' | 'grid5'
  className?: string
}
const GalleryImages = ({ images, gridType = 'grid1', className }: Props) => {
  let [isOpen, setIsOpen] = useState(false)
  let [startIndex, setStartIndex] = useState(0)

  const handleOpenDialog = (index = 0) => {
    setStartIndex(index)
    setIsOpen(true)
  }

  return (
    <>
      <div className={className}>
        {gridType === 'grid1' && <HeaderGalleryGrid1 images={images} handleOpenDialog={handleOpenDialog} />}
        {gridType === 'grid2' && <HeaderGalleryGrid2 images={images} handleOpenDialog={handleOpenDialog} />}
        {gridType === 'grid3' && <HeaderGalleryGrid3 images={images} handleOpenDialog={handleOpenDialog} />}
        {gridType === 'grid4' && <HeaderGalleryGrid4 images={images} handleOpenDialog={handleOpenDialog} />}
        {gridType === 'grid5' && <HeaderGalleryGrid5 images={images} handleOpenDialog={handleOpenDialog} />}
      </div>

      {/* Dialog for image lightbox — orta boy, full-screen değil */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/85 backdrop-blur-sm" />

        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
          <DialogPanel
            transition
            className="relative mx-auto aspect-square w-full max-w-xl transition data-closed:opacity-0 sm:max-w-2xl"
          >
            <EmblaCarousel images={images} option={{ startIndex, slidesToScroll: 1 }} />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

const HeaderGalleryGrid1 = ({
  images,
  handleOpenDialog,
}: {
  images: string[]
  handleOpenDialog: (index?: number) => void
}) => {
  if (!images.length) return null

  return (
    <header className="relative md:grid md:grid-cols-4 md:gap-6">
      <div className="relative aspect-4/5 size-full md:col-span-2 md:aspect-4/4" onClick={() => handleOpenDialog(0)}>
        <Image
          fill
          className="rounded-xl object-cover transition-[filter] hover:brightness-95"
          src={images[0]}
          alt="bigger"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
        />
      </div>
      <div className="hidden md:col-span-2 md:grid md:grid-cols-2 md:gap-6">
        {images.slice(1, 5).map((item, index) => (
          <div className="relative aspect-2/2 size-full" key={index} onClick={() => handleOpenDialog(index + 1)}>
            <Image
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              src={item || ''}
              alt="others"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 left-3">
        <Button size="smaller" color="light" onClick={() => handleOpenDialog()} className="[--btn-border:white]/0">
          <Squares2X2Icon className="h-5 w-5" />
          <span className="text-sm/6 font-normal">Show all photos</span>
        </Button>
      </div>
    </header>
  )
}
const HeaderGalleryGrid2 = ({
  images,
  handleOpenDialog,
}: {
  images: string[]
  handleOpenDialog: (index?: number) => void
}) => {
  if (!images.length) return null

  return (
    <header className="relative md:grid md:grid-cols-4">
      <div className="relative aspect-4/5 size-full md:col-span-3 md:aspect-5/4" onClick={() => handleOpenDialog(0)}>
        <Image
          alt=""
          src={images[0]}
          fill
          className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
        />
      </div>

      <div className="hidden md:grid md:grid-cols-1 md:gap-4 md:ps-4">
        {images.slice(1, 4).map((item, index) => (
          <div className="relative aspect-3/2 size-full" key={index} onClick={() => handleOpenDialog(index + 1)}>
            <Image
              alt=""
              src={item}
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 left-3">
        <Button color="light" onClick={() => handleOpenDialog()} className="[--btn-border:white]/0">
          <Squares2X2Icon className="h-5 w-5" />
          <span className="text-sm/6 font-normal">Show all photos</span>
        </Button>
      </div>
    </header>
  )
}
const HeaderGalleryGrid3 = ({
  images,
  handleOpenDialog,
}: {
  images: string[]
  handleOpenDialog: (index?: number) => void
}) => {
  if (!images.length) return null

  return (
    <header className="relative md:grid md:grid-cols-3 md:gap-6">
      <div className="relative aspect-4/5 size-full md:aspect-3/4" onClick={() => handleOpenDialog(0)}>
        <Image
          alt=""
          src={images[0]}
          fill
          className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
        />
      </div>

      <div className="hidden md:grid md:grid-cols-1 md:gap-6">
        <div className="relative aspect-3/2 size-full" onClick={() => handleOpenDialog(1)}>
          {images[1] && (
            <Image
              alt=""
              src={images[1]}
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          )}
        </div>
        <div className="relative aspect-3/2 size-full" onClick={() => handleOpenDialog(2)}>
          {images[2] && (
            <Image
              alt=""
              src={images[2]}
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          )}
        </div>
      </div>

      <div className="relative hidden size-full md:block md:aspect-3/4" onClick={() => handleOpenDialog(3)}>
        {images[3] && (
          <Image
            alt=""
            src={images[3]}
            fill
            className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
          />
        )}
      </div>

      <div className="absolute bottom-3 left-3">
        <Button color="light" onClick={() => handleOpenDialog()} className="[--btn-border:white]/0">
          <Squares2X2Icon className="h-5 w-5" />
          <span className="text-sm/6 font-normal">Show all photos</span>
        </Button>
      </div>
    </header>
  )
}
const HeaderGalleryGrid4 = ({
  images,
  handleOpenDialog,
}: {
  images: string[]
  handleOpenDialog: (index?: number) => void
}) => {
  if (!images.length) return null

  return (
    <header className="relative md:grid md:grid-cols-3 md:gap-6">
      <div className="relative aspect-4/5 size-full md:aspect-3/4" onClick={() => handleOpenDialog(0)}>
        <Image
          alt=""
          src={images[0]}
          fill
          className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
        />
      </div>

      <div className="relative hidden aspect-4/5 size-full md:block md:aspect-3/4" onClick={() => handleOpenDialog(3)}>
        {images[3] && (
          <Image
            alt=""
            src={images[3]}
            fill
            className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
          />
        )}
      </div>

      <div className="hidden md:grid md:grid-cols-1 md:gap-6">
        <div className="relative aspect-3/2 size-full" onClick={() => handleOpenDialog(1)}>
          {images[1] && (
            <Image
              alt=""
              src={images[1]}
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          )}
        </div>
        <div className="relative aspect-3/2 size-full" onClick={() => handleOpenDialog(2)}>
          {images[2] && (
            <Image
              alt=""
              src={images[2]}
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          )}
        </div>
      </div>

      <div className="absolute bottom-3 left-3">
        <Button color="light" onClick={() => handleOpenDialog()} className="[--btn-border:white]/0">
          <Squares2X2Icon className="h-5 w-5" />
          <span className="text-sm/6 font-normal">Show all photos</span>
        </Button>
      </div>
    </header>
  )
}
const HeaderGalleryGrid5 = ({
  images,
  handleOpenDialog,
}: {
  images: string[]
  handleOpenDialog: (index?: number) => void
}) => {
  if (!images.length) return null

  // En fazla 5 thumbnail göster (ilk büyük resim hariç)
  const thumbs = images.slice(1, 6).filter(Boolean)

  return (
    <div className="mx-auto w-full max-w-[340px] sm:max-w-[400px]">
      {/* Ana resim — sabit kare, en fazla 400px */}
      <div
        className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl"
        onClick={() => handleOpenDialog(0)}
      >
        <Image
          fill
          sizes="(max-width: 640px) 340px, 400px"
          src={images[0]}
          className="object-cover transition-[filter] hover:brightness-95"
          alt=""
          priority
        />
      </div>
      {thumbs.length > 0 && (
        <div className="mt-2 grid grid-cols-5 gap-1.5 sm:mt-3 sm:gap-2">
          {thumbs.map((image, index) => (
            <button
              type="button"
              key={index}
              aria-label={`Görsel ${index + 2}`}
              className="relative aspect-square overflow-hidden rounded-lg"
              onClick={() => handleOpenDialog(index + 1)}
            >
              <Image
                sizes="80px"
                fill
                src={image}
                className="object-cover transition-[filter] hover:brightness-95"
                alt=""
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default GalleryImages
