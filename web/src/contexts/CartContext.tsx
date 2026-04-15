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

interface CartContextType {
  items: CartItem[]
  totalQuantity: number
  subtotal: number
  isHydrated: boolean
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  isHydrated: false,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
})

const STORAGE_KEY = 'pureolentia_cart'

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setItems(readCartFromStorage())
    setIsHydrated(true)

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== STORAGE_KEY) return
      setItems(readCartFromStorage())
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
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
  }, [])

  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  return (
    <CartContext.Provider
      value={{ items, totalQuantity, subtotal, isHydrated, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
