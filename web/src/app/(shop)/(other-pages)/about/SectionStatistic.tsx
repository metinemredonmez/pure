import Heading from '@/components/Heading/Heading'
import { FC } from 'react'

export interface Statistic {
  id: string
  heading: string
  subHeading: string
}

const FOUNDER_DEMO: Statistic[] = [
  {
    id: '1',
    heading: '50+',
    subHeading: 'Farklı menşeilerden özenle seçilmiş specialty kahve çeşidi',
  },
  {
    id: '2',
    heading: '10K+',
    subHeading: 'Mutlu müşteri ve aktif kahve abonesi',
  },
  {
    id: '3',
    heading: '15+',
    subHeading: 'Ülkeden doğrudan çiftçilerle çalışıyoruz',
  },
]

export interface SectionStatisticProps {
  className?: string
}

const SectionStatistic: FC<SectionStatisticProps> = ({ className = '' }) => {
  return (
    <div className={`nc-SectionStatistic relative ${className}`}>
      <Heading
        description="Kahve tutkumuz rakamlarla. Kalite ve sürdürülebilirlik odaklı yaklaşımımız."
      >
        Rakamlarla Pure Olentia
      </Heading>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
        {FOUNDER_DEMO.map((item) => (
          <div key={item.id} className="rounded-2xl bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-800">
            <h3 className="text-2xl leading-none font-semibold text-neutral-900 md:text-3xl dark:text-neutral-200">
              {item.heading}
            </h3>
            <span className="mt-10 block max-w-sm text-sm text-neutral-500 sm:text-base dark:text-neutral-400">
              {item.subHeading}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SectionStatistic
