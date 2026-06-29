import { useCallback, useEffect, useState } from 'react'
import { fetchPublicCategories, fetchPublicMenuItems } from '../api/restaurants'
import type { Category, MenuItem } from '../types/company'
import { getApiErrorMessage } from '../utils/apiError'

export function useRestaurantMenu(companyId: string) {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [cats, items] = await Promise.all([
        fetchPublicCategories(companyId),
        fetchPublicMenuItems(companyId),
      ])
      setCategories(cats)
      setMenuItems(items)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar o cardápio.'))
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    load()
  }, [load])

  return { categories, menuItems, loading, error, reload: load }
}
