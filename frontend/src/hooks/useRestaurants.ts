import { useCallback, useEffect, useState } from 'react'
import { fetchRestaurants } from '../api/restaurants'
import type { Restaurant } from '../types/restaurant'
import { getApiErrorMessage } from '../utils/apiError'

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRestaurants(await fetchRestaurants())
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os restaurantes.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { restaurants, loading, error, reload: load }
}
