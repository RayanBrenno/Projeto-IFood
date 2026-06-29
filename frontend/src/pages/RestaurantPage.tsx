import { useParams } from 'react-router-dom'
import { PageContainer } from '../components/layout/PageContainer'
import { TopBar } from '../components/layout/TopBar'
import { PublicMenuItemRow } from '../components/domain/PublicMenuItemRow'
import { useRestaurantMenu } from '../hooks/useRestaurantMenu'

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const { categories, menuItems, loading, error, reload } = useRestaurantMenu(id ?? '')

  const itemsByCategory = categories.map((category) => ({
    category,
    items: menuItems.filter((item) => item.categoryId === category.id),
  }))

  return (
    <PageContainer>
      <TopBar title="Cardápio" back />

      <div className="lg:w-4/5 lg:mx-auto">
        {loading ? (
          <p className="text-sm text-gray-400 text-center pt-10">Carregando cardápio…</p>
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
        ) : menuItems.length === 0 ? (
          <p className="text-sm text-gray-400 text-center pt-10">Esse restaurante ainda não tem cardápio.</p>
        ) : (
          <div className="flex flex-col gap-5 pt-3">
            {itemsByCategory
              .filter(({ items }) => items.length > 0)
              .map(({ category, items }) => (
                <div key={category.id} className="flex flex-col gap-2">
                  <h2 className="font-display font-semibold text-base text-ink">{category.name}</h2>
                  <div className="flex flex-col gap-2">
                    {items.map((item) => (
                      <PublicMenuItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
