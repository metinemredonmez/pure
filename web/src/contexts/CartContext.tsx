'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface CartItem {
  id: string
  productId: string
  name: string
  handle: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
  variantId?: string
}

export interface AppliedCoupon {
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  discount: number
  freeShipping: boolean
  description?: string
}

interface CartContextType {
  items: CartItem[]
  totalQuantity: number
  subtotal: number
  isHydrated: boolean
  coupon: AppliedCoupon | null
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  isHydrated: false,
  coupon: null,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  applyCoupon: () => {},
  removeCoupon: () => {},
})

const STORAGE_KEY = 'pureolentia_cart'
const STORAGE_OWNER_KEY = 'pureolentia_cart_owner'
const STORAGE_COUPON_KEY = 'pureolentia_cart_coupon'

function getCurrentCartOwner(): 'guest' | `user:${string}` {
  if (typeof window === 'undefined') return 'guest'

  try {
    const rawUser = localStorage.getItem('pureolentia_user')
    if (!rawUser) return 'guest'

    const user = JSON.parse(rawUser)
    const userId = user?.id || user?.userId
    return userId ? `user:${userId}` : 'guest'
  } catch {
    return 'guest'
  }
}

function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistCart(items: CartItem[]) {
  if (typeof window === 'undefined') return

  try {
    const owner = getCurrentCartOwner()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    localStorage.setItem(STORAGE_OWNER_KEY, owner)
  } catch {}
}

function clearPersistedCart() {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    localStorage.setItem(STORAGE_OWNER_KEY, getCurrentCartOwner())
  } catch {}
}

function readCouponFromStorage(): AppliedCoupon | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_COUPON_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistCoupon(coupon: AppliedCoupon | null) {
  if (typeof window === 'undefined') return
  try {
    if (coupon) {
      localStorage.setItem(STORAGE_COUPON_KEY, JSON.stringify(coupon))
    } else {
      localStorage.removeItem(STORAGE_COUPON_KEY)
    }
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null)

  useEffect(() => {
    const syncCart = () => {
      const owner = getCurrentCartOwner()
      const storedOwner = localStorage.getItem(STORAGE_OWNER_KEY) || 'guest'

      if (storedOwner !== owner) {
        clearPersistedCart()
        setItems([])
        persistCoupon(null)
        setCoupon(null)
      } else {
        setItems(readCartFromStorage())
        setCoupon(readCouponFromStorage())
      }

      setIsHydrated(true)
    }

    syncCart()

    const handleStorage = (event: StorageEvent) => {
      if (event.key && ![STORAGE_KEY, STORAGE_OWNER_KEY, 'pureolentia_user', 'pureolentia_token'].includes(event.key)) return
      syncCart()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', syncCart)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', syncCart)
    }
  }, [])

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    setItems((currentItems) => {
      const existing = currentItems.find(
        (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
      )

      const nextItems = existing
        ? currentItems.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
              : item
          )
        : [
            ...currentItems,
            {
              ...newItem,
              id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              quantity: newItem.quantity || 1,
            },
          ]

      persistCart(nextItems)
      return nextItems
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => {
      const nextItems = currentItems.filter((item) => item.id !== id)
      persistCart(nextItems)
      return nextItems
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((currentItems) => {
      const nextItems = quantity < 1
        ? currentItems.filter((item) => item.id !== id)
        : currentItems.map((item) => (item.id === id ? { ...item, quantity } : item))

      persistCart(nextItems)
      return nextItems
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems(() => {
      persistCart([])
      return []
    })
    persistCoupon(null)
    setCoupon(null)
  }, [])

  const applyCoupon = useCallback((next: AppliedCoupon) => {
    persistCoupon(next)
    setCoupon(next)
  }, [])

  const removeCoupon = useCallback(() => {
    persistCoupon(null)
    setCoupon(null)
  }, [])

  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  return (
    <CartContext.Provider
      value={{ items, totalQuantity, subtotal, isHydrated, coupon, addItem, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
