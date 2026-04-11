'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { FC } from 'react'

const DEMO_DATA = [
  {
    name: 'Saklama Koşulları',
    content: `<ul class="list-disc list-inside leading-7">
    <li>Serin, kuru ve doğrudan güneş ışığı almayan bir yerde saklayın.</li>
    <li>Hava almayan, ağzı kapalı kaplarda muhafaza edin.</li>
    <li>Buzdolabında saklamayın — nem ve koku aroma kaybına sebep olur.</li>
    <li>Kavurma tarihinden itibaren 4 hafta içinde tüketmeniz önerilir.</li>
    <li>Öğütülmüş kahveyi mümkünse 2 hafta içinde tüketin.</li>
  </ul>`,
  },
  {
    name: 'Demleme Önerileri',
    content: `<ul class="list-disc list-inside leading-7">
    <li><strong>V60 / Chemex:</strong> 1:16 oranı, 92-94°C su, orta-ince öğütme</li>
    <li><strong>French Press:</strong> 1:15 oranı, 95°C su, iri öğütme, 4 dk bekletme</li>
    <li><strong>Espresso:</strong> 18g → 36g çıkış, 9 bar, 25-30 saniye ekstraksiyon</li>
    <li><strong>Türk Kahvesi:</strong> Toz inceliğinde öğütme, düşük ateşte yavaş pişirme</li>
    <li>En iyi sonuç için her zaman taze öğütün.</li>
  </ul>`,
  },
  {
    name: 'Kargo ve İade',
    content: `<ul class="list-disc list-inside leading-7">
    <li>Siparişiniz 24 saat içinde taze kavrulup kargoya verilir.</li>
    <li>300 TL üzeri siparişlerde kargo ücretsizdir.</li>
    <li>Türkiye geneline 1-3 iş günü içinde teslimat.</li>
    <li>Ambalajı açılmamış ürünlerde 14 gün içinde iade hakkı.</li>
  </ul>`,
  },
  {
    name: 'Sıkça Sorulan Sorular',
    content: `<ul class="list-disc list-inside leading-7">
    <li>Kahveniz ne zaman kavruluyor? — Siparişiniz alındıktan sonra 24 saat içinde.</li>
    <li>Hangi ödeme yöntemlerini kabul ediyorsunuz? — Kredi kartı, banka kartı ve havale/EFT.</li>
    <li>Abonelik iptal edilebilir mi? — Evet, istediğiniz zaman hesap panelinizden.</li>
    <li>Toplu sipariş indirimi var mı? — 10kg ve üzeri için özel fiyatlar için B2B sayfamıza bakın.</li>
  </ul>`,
  },
]

interface Props {
  panelClassName?: string
  data?: typeof DEMO_DATA
}

const AccordionInfo: FC<Props> = ({
  panelClassName = 'p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6',
  data = DEMO_DATA,
}) => {
  return (
    <div className="w-full space-y-2.5 rounded-2xl">
      {/* ============ */}
      {data.map((item, index) => {
        return (
          <Disclosure key={index} defaultOpen={index < 2}>
            {({ open }) => (
              <div>
                <DisclosureButton className="flex w-full items-center justify-between rounded-lg bg-neutral-100/80 px-4 py-2 text-left font-medium hover:bg-neutral-200/60 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-neutral-500/75 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                  <span>{item.name}</span>
                  {!open ? (
                    <PlusIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <MinusIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  )}
                </DisclosureButton>
                <DisclosurePanel className={panelClassName} as="div">
                  <div dangerouslySetInnerHTML={{ __html: item.content }}></div>
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        )
      })}

      {/* ============ */}
    </div>
  )
}

export default AccordionInfo
