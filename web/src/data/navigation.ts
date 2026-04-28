import { getSiteSettings } from '@/lib/site-settings'

export async function getNavigation(): Promise<TNavigationItem[]> {
  const settings = await getSiteSettings()
  return settings.navMenus.map((m): TNavigationItem => ({
    id: m.id,
    href: m.href,
    name: m.name,
    type: m.children && m.children.length ? 'dropdown' : undefined,
    children: m.children?.map((c) => ({
      id: c.id,
      href: c.href,
      name: c.name,
      description: c.description,
      icon: c.id, // mapped to SVG by handle in the renderer
    })),
  }))
}

export async function getNavMegaMenu(): Promise<TNavigationItem> {
  const settings = await getSiteSettings()
  return {
    id: 'mega',
    href: '/collections/all',
    name: 'Kahveler',
    type: 'mega-menu',
    children: settings.megaMenu.map((g): TNavigationItem => ({
      id: g.id,
      href: '#',
      name: g.name,
      type: 'dropdown',
      children: g.items.map((c) => ({ id: c.id, href: c.href, name: c.name })),
    })),
  }
}

// ============ TYPE =============
export type TNavigationItem = Partial<{
  id: string
  href: string
  name: string
  type?: 'dropdown' | 'mega-menu'
  isNew?: boolean
  children?: TNavigationItem[]
  icon?: string
  description?: string
}>

export const getLanguages = async () => {
  return [
    {
      id: 'Turkce',
      name: 'Türkçe',
      description: 'Türkiye',
      href: '#',
      active: true,
    },
    {
      id: 'English',
      name: 'English',
      description: 'United States',
      href: '#',
    },
  ]
}
export const getCurrencies = async () => {
  return [
    {
      id: 'TRY',
      name: 'TRY',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"></path>
    <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor" font-family="sans-serif">₺</text>
</svg>`,
      active: true,
    },
    {
      id: 'EUR',
      name: 'EUR',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"></path>
    <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor" font-family="sans-serif">€</text>
</svg>`,
    },
    {
      id: 'USD',
      name: 'USD',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"></path>
    <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor" font-family="sans-serif">$</text>
</svg>`,
    },
  ]
}

export const getHeaderDropdownCategories = async () => {
  return [
    {
      name: 'Türk Kahvesi',
      handle: 'turk-kahvesi',
      description: 'Geleneksel Türk kahvesi çeşitleri',
      icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M3 8H21V8C21 13.5228 17.5228 17 12 17C6.47715 17 3 13.5228 3 8V8Z" stroke="currentColor" stroke-width="1.5"/>
    <path d="M8 20H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M12 17V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M10 4C10 4 10.5 2 12 2C13.5 2 14 4 14 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    },
    {
      name: 'Filtre Kahve',
      handle: 'filtre-kahve',
      description: 'Pour-over & filtre demleme',
      icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4L18 4L15 20H9L6 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M4 4H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M10 9L14 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    },
    {
      name: 'Espresso',
      handle: 'espresso',
      description: 'Espresso makineleri için özel',
      icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="8" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M19 11H20C21.1046 11 22 11.8954 22 13C22 14.1046 21.1046 15 20 15H19" stroke="currentColor" stroke-width="1.5"/>
    <path d="M9 5C9 5 9.5 3 12 3C14.5 3 15 5 15 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    },
  ]
}
