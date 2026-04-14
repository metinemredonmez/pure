'use client'

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from 'react'

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

// ── External store for cart (survives across components) ──
let cartItems: CartItem[] = []
let listeners: Set<() => void> = new Set()

function emitChange() {
  listeners.forEach((l) => l())
}

function getSnapshot(): CartItem[] {
  return cartItems
}

function getServerSnapshot(): CartItem[] {
  return []
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Load from localStorage on module init (client only)
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) cartItems = JSON.parse(raw)
  } catch {}
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
  } catch {}
}

// ── Provider ──

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    const existing = cartItems.find(
      (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
    )
    if (existing) {
      cartItems = cartItems.map((i) =>
        i.id === existing.id ? { ...i, quantity: i.quantity + (newItem.quantity || 1) } : i
      )
    } else {
      const id = `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      cartItems = [...cartItems, { ...newItem, id, quantity: newItem.quantity || 1 }]
    }
    persist()
    emitChange()
  }, [])

  const removeItem = useCallback((id: string) => {
    cartItems = cartItems.filter((i) => i.id !== id)
    persist()
    emitChange()
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      cartItems = cartItems.filter((i) => i.id !== id)
    } else {
      cartItems = cartItems.map((i) => (i.id === id ? { ...i, quantity } : i))
    }
    persist()
    emitChange()
  }, [])

  const clearCart = useCallback(() => {
    cartItems = []
    persist()
    emitChange()
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
