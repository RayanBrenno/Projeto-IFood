import { api } from './axios'
import type { CustomerOrder, Order, OrderStatus } from '../types/company'

export interface OrderItemPayload {
  menu_item_id: string
  quantity: number
  size_id?: string
}

export interface CreateOrderPayload {
  company_id: string
  items: OrderItemPayload[]
  notes?: string
}

function formatTimeLabel(createdAt: string): { timeLabel: string; placedMinutesAgo: number } {
  const diffMin = Math.round((Date.now() - new Date(createdAt).getTime()) / 60000)
  const timeLabel = diffMin < 60 ? `há ${diffMin} min` : `há ${Math.round(diffMin / 60)}h`
  return { timeLabel, placedMinutesAgo: diffMin }
}

function toOrder(raw: any): Order {
  const { timeLabel, placedMinutesAgo } = formatTimeLabel(raw.created_at)
  return {
    id: raw.id,
    customerName: raw.customer_name,
    status: raw.status as OrderStatus,
    total: raw.total,
    notes: raw.notes ?? undefined,
    timeLabel,
    placedMinutesAgo,
    items: raw.items.map((i: any) => ({
      name: i.size_label ? `${i.name} (${i.size_label})` : i.name,
      quantity: i.quantity,
    })),
  }
}

function toCustomerOrder(raw: any): CustomerOrder {
  return { ...toOrder(raw), companyName: raw.company_name ?? '' }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post('/orders/', payload)
  return toOrder(data)
}

export async function fetchRestaurantOrders(): Promise<Order[]> {
  const { data } = await api.get<any[]>('/orders/restaurant')
  return data.map(toOrder)
}

export async function fetchMyOrders(): Promise<CustomerOrder[]> {
  const { data } = await api.get<any[]>('/orders/me')
  return data.map(toCustomerOrder)
}

export async function fetchMyOrder(orderId: string): Promise<CustomerOrder> {
  const { data } = await api.get<any>(`/orders/me/${orderId}`)
  return toCustomerOrder(data)
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
  const { data } = await api.patch(`/orders/${orderId}/status`, { status: newStatus })
  return toOrder(data)
}
