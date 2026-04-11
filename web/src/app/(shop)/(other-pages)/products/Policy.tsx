const A_FEATURES = [
  {
    color: 'bg-amber-50 dark:bg-amber-50/90',
    name: 'Ücretsiz Kargo',
    desc: '300 TL üzeri siparişlerde ücretsiz',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 14H13C14.1 14 15 13.1 15 12V2H6C4.5 2 3.19001 2.82999 2.51001 4.04999" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 17C2 18.66 3.34 20 5 20H6C6 18.9 6.9 18 8 18C9.1 18 10 18.9 10 20H14C14 18.9 14.9 18 16 18C17.1 18 18 18.9 18 20H19C20.66 20 22 18.66 22 17V14H19C18.45 14 18 13.55 18 13V10C18 9.45 18.45 9 19 9H20.29L18.58 6.01001C18.22 5.39001 17.56 5 16.84 5H15V12C15 13.1 14.1 14 13 14H12" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 22C9.10457 22 10 21.1046 10 20C10 18.8954 9.10457 18 8 18C6.89543 18 6 18.8954 6 20C6 21.1046 6.89543 22 8 22Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 22C17.1046 22 18 21.1046 18 20C18 18.8954 17.1046 18 16 18C14.8954 18 14 18.8954 14 20C14 21.1046 14.8954 22 16 22Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    color: 'bg-orange-50 dark:bg-orange-50/90',
    name: 'Taze Kavurma',
    desc: 'Siparişiniz sonrası 24 saat içinde',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8H18C20.21 8 22 9.79 22 12V14C22 16.21 20.21 18 18 18H6C3.79 18 2 16.21 2 14V12C2 9.79 3.79 8 6 8Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 5V3M12 5V3M16 5V3" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 13H22" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    color: 'bg-emerald-50 dark:bg-emerald-50/90',
    name: 'Türkiye Geneli Teslimat',
    desc: '1-3 iş günü içinde kapınızda',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.99998 3H8.99998C7.04998 8.84 7.04998 15.16 8.99998 21H7.99998" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 3C16.95 8.84 16.95 15.16 15 21" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 16V15C8.84 16.95 15.16 16.95 21 15V16" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 9.0001C8.84 7.0501 15.16 7.0501 21 9.0001" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    color: 'bg-sky-50 dark:bg-sky-50/90',
    name: '14 Gün İade',
    desc: 'Ambalajı açılmamış ürünlerde',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 15C22 18.87 18.87 22 15 22L16.05 20.25" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 9C2 5.13 5.13 2 9 2L7.95 3.75" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17 3V7H21" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22 2L17 7" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 7.5V16.5" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
]

const Policy = () => {
  return (
    <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
      {A_FEATURES.map((item, index) => {
        return (
          <div key={index} className={`flex flex-col rounded-2xl p-5 ${item.color} `}>
            <div dangerouslySetInnerHTML={{ __html: item.svg }}></div>
            <div className="mt-2.5">
              <p className="font-semibold text-neutral-900">{item.name}</p>
              <p className="mt-0.5 text-sm text-neutral-500">{item.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Policy
