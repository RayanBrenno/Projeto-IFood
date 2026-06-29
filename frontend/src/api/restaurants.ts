import { api } from './axios'
import { fromApiMenuItem } from './menu'
import type { Category, MenuItem } from '../types/company'
import type { Restaurant } from '../types/restaurant'

function fromApiRestaurant(raw: any): Restaurant {
  return {
    id: raw.id,
    businessName: raw.business_name,
    category: raw.category,
  }
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const { data } = await api.get<any[]>('/restaurants', { params: { limit: 100 } })
  return data.map(fromApiRestaurant)
}

export async function fetchPublicCategories(companyId: string): Promise<Category[]> {
  const { data } = await api.get<Category[]>(`/menu/public/${companyId}/categories`, { params: { limit: 100 } })
  return data
}

export async function fetchPublicMenuItems(companyId: string): Promise<MenuItem[]> {
  const { data } = await api.get<any[]>(`/menu/public/${companyId}/items`, { params: { limit: 100 } })
  return data.map(fromApiMenuItem)
}
