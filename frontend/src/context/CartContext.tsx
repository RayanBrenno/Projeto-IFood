import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CartItem, MenuItem } from '../types/company'

interface CartState {
  companyId: string | null
  items: CartItem[]
}

interface CartContextValue extends CartState {
  total: number
  addItem(companyId: string, menuItem: MenuItem, quantity?: number, sizeId?: string, sizeLabel?: string, unitPrice?: number): void
  removeItem(menuItemId: string, sizeId?: string): void
  clearCart(): void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({ companyId: null, items: [] })

  const total = cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  function addItem(
    companyId: string,
    menuItem: MenuItem,
    quantity = 1,
    sizeId?: string,
    sizeLabel?: string,
    unitPrice?: number,
  ) {
    const price = unitPrice ?? menuItem.price ?? 0
    setCart((prev) => {
      if (prev.companyId && prev.companyId !== companyId) {
        return { companyId, items: [{ menuItem, quantity, sizeId, sizeLabel, unitPrice: price }] }
      }
      const existingIdx = prev.items.findIndex(
        (i) => i.menuItem.id === menuItem.id && i.sizeId === sizeId,
      )
      if (existingIdx !== -1) {
        const updated = [...prev.items]
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + quantity }
        return { companyId, items: updated }
      }
      return {
        companyId,
        items: [...prev.items, { menuItem, quantity, sizeId, sizeLabel, unitPrice: price }],
      }
    })
  }

  function removeItem(menuItemId: string, sizeId?: string) {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => !(i.menuItem.id === menuItemId && i.sizeId === sizeId)),
    }))
  }

  function clearCart() {
    setCart({ companyId: null, items: [] })
  }

  return (
    <CartContext.Provider value={{ ...cart, total, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider')
  return ctx
}
