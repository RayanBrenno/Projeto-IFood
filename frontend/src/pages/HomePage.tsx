import { Link } from 'react-router-dom'
import { PageContainer } from '../components/layout/PageContainer'
import { TopBar } from '../components/layout/TopBar'
import { useAuth } from '../hooks/useAuth'
import { useRestaurants } from '../hooks/useRestaurants'

export default function HomePage() {
  const { logout } = useAuth()
  const { restaurants, loading, error, reload } = useRestaurants()

  return (
    <PageContainer>
      <TopBar
        title="Fooomé"
        actions={
          <button
            type="button"
            onClick={logout}
            aria-label="Sair"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm font-semibold text-gray-500"
          >
            Sair
          </button>
        }
      />

      <div className="lg:w-4/5 lg:mx-auto">
        {loading ? (
          <p className="text-sm text-gray-400 text-center pt-10">Carregando restaurantes…</p>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 pt-10">
            <p className="text-sm text-gray-400 text-center">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="min-h-[44px] rounded-full bg-brand px-4 text-sm font-semibold text-white"
            >
              Tentar novamente
            </button>
          </div>
        ) : restaurants.length === 0 ? (
          <p className="text-sm text-gray-400 text-center pt-10">Nenhum restaurante cadastrado ainda.</p>
        ) : (
          <div className="flex flex-col gap-3 pt-3">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/restaurants/${restaurant.id}`}
                className="flex min-h-[44px] items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 shadow-sm"
              >
                <div className="h-12 w-12 flex-none rounded-lg bg-gray-100" aria-hidden />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-ink">{restaurant.businessName}</span>
                  <span className="text-xs text-gray-400">{restaurant.category}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
