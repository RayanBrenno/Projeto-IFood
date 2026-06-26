export type OrderStatus = 'CRIADO' | 'CONFIRMADO' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE'

export interface OrderItem {
  name: string
  quantity: number
}

export interface Order {
  id: string
  customerName: string
  status: OrderStatus
  total: number
  timeLabel: string
  placedMinutesAgo: number
  notes?: string
  items: OrderItem[]
}

export type MenuItemKind = 'SIMPLES' | 'COM_TAMANHOS' | 'UNITARIO_COM_INGREDIENTES'

export interface MenuItemSize {
  id: string
  label: string
  price: number
}

export interface Ingredient {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  category: string
  available: boolean
  photoUrl?: string
  kind: MenuItemKind
  price?: number
  sizes?: MenuItemSize[]
  removableIngredientIds?: string[]
}
