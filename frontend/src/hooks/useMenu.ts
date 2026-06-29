import { useCallback, useEffect, useState } from 'react'
import {
  createCategory,
  createIngredient,
  createMenuItem,
  fetchCategories,
  fetchIngredients,
  fetchMenuItems,
  updateMenuItem,
  updateMenuItemAvailability,
} from '../api/menu'
import type { Category, Ingredient, MenuItem, MenuItemPayload } from '../types/company'
import { getApiErrorMessage } from '../utils/apiError'

export function useMenu() {
  const [categories, setCategories] = useState<Category[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [cats, ings, items] = await Promise.all([fetchCategories(), fetchIngredients(), fetchMenuItems()])
      setCategories(cats)
      setIngredients(ings)
      setMenuItems(items)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar o cardápio.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  async function addCategory(name: string): Promise<Category> {
    const existing = categories.find((category) => category.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing

    const category = await createCategory(name)
    setCategories((prev) => [...prev, category])
    return category
  }

  async function addIngredient(name: string): Promise<Ingredient> {
    const existing = ingredients.find((ingredient) => ingredient.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing

    const ingredient = await createIngredient(name)
    setIngredients((prev) => [...prev, ingredient])
    return ingredient
  }

  async function saveItem(data: MenuItemPayload, editingId?: string): Promise<void> {
    if (editingId) {
      const updated = await updateMenuItem(editingId, data)
      setMenuItems((prev) => prev.map((item) => (item.id === editingId ? updated : item)))
    } else {
      const created = await createMenuItem(data)
      setMenuItems((prev) => [created, ...prev])
    }
  }

  async function toggleAvailable(itemId: string): Promise<void> {
    const current = menuItems.find((item) => item.id === itemId)
    if (!current) return

    const updated = await updateMenuItemAvailability(itemId, !current.available)
    setMenuItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)))
  }

  return {
    categories,
    ingredients,
    menuItems,
    loading,
    error,
    addCategory,
    addIngredient,
    saveItem,
    toggleAvailable,
    reload: loadAll,
  }
}
