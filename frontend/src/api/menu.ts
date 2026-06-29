import { api } from './axios'
import type { Category, Ingredient, MenuItem, MenuItemPayload } from '../types/company'

function toApiPayload(data: MenuItemPayload) {
  return {
    name: data.name,
    description: data.description,
    category_id: data.categoryId,
    kind: data.kind,
    price: data.price,
    sizes: data.sizes,
    removable_ingredient_ids: data.removableIngredientIds,
  }
}

export function fromApiMenuItem(raw: any): MenuItem {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    categoryId: raw.category_id,
    available: raw.available,
    kind: raw.kind,
    price: raw.price ?? undefined,
    sizes: raw.sizes ?? undefined,
    removableIngredientIds: raw.removable_ingredient_ids ?? undefined,
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/menu/categories', { params: { limit: 100 } })
  return data
}

export async function createCategory(name: string): Promise<Category> {
  const { data } = await api.post<Category>('/menu/categories', { name })
  return data
}

export async function fetchIngredients(): Promise<Ingredient[]> {
  const { data } = await api.get<Ingredient[]>('/menu/ingredients', { params: { limit: 100 } })
  return data
}

export async function createIngredient(name: string): Promise<Ingredient> {
  const { data } = await api.post<Ingredient>('/menu/ingredients', { name })
  return data
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data } = await api.get<any[]>('/menu/items', { params: { limit: 100 } })
  return data.map(fromApiMenuItem)
}

export async function createMenuItem(payload: MenuItemPayload): Promise<MenuItem> {
  const { data } = await api.post('/menu/items', toApiPayload(payload))
  return fromApiMenuItem(data)
}

export async function updateMenuItem(id: string, payload: MenuItemPayload): Promise<MenuItem> {
  const { data } = await api.put(`/menu/items/${id}`, toApiPayload(payload))
  return fromApiMenuItem(data)
}

export async function updateMenuItemAvailability(id: string, available: boolean): Promise<MenuItem> {
  const { data } = await api.patch(`/menu/items/${id}/availability`, { available })
  return fromApiMenuItem(data)
}
