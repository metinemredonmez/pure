'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

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
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
})

const STORAGE_KEY = 'pureolentia_cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // SSR-safe: return empty on server, load from localStorage on client
    if (typeof window === 'undefined') return []
    return loadCart()
  })
  const [mounted, setMounted] = useState(false)

  // Mark as mounted after first render (client-side only)
  useEffect(() => {
    // Re-load from localStorage in case SSR hydration reset state
    setItems(loadCart())
    setMounted(true)
  }, [])

  // Save cart to localStorage whenever items change (skip initial empty render)
  useEffect(() => {
    if (!mounted) return
    saveCart(items)
  }, [items, mounted])

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    setItems((prev) => {
      let updated: CartItem[]
      const existing = prev.find(
        (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
      )
      if (existing) {
        updated = prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + (newItem.quantity || 1) } : i
        )
      } else {
        const id = `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        updated = [...prev, { ...newItem, id, quantity: newItem.quantity || 1 }]
      }
      // Immediately persist to localStorage (don't wait for useEffect)
      saveCart(updated)
      return updated
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id)
      saveCart(updated)
      return updated
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => {
      let updated: CartItem[]
      if (quantity < 1) {
        updated = prev.filter((i) => i.id !== id)
      } else {
        updated = prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      }
      saveCart(updated)
      return updated
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, totalQuantity, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
