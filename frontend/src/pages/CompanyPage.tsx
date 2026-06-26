import { useState } from 'react'
import { BottomSheet } from '../components/layout/BottomSheet'
import { PageContainer } from '../components/layout/PageContainer'
import { TopBar } from '../components/layout/TopBar'
import { MenuItemForm } from '../components/domain/MenuItemForm'
import { MenuItemRow } from '../components/domain/MenuItemRow'
import { OrderCard } from '../components/domain/OrderCard'
import { mockCategories, mockIngredients, mockMenuItems, mockOrders } from '../mocks/companyMockData'
import type { Category, Ingredient, MenuItem, OrderStatus } from '../types/company'
import { useAuth } from '../hooks/useAuth'

const STATUS_FLOW: OrderStatus[] = ['CRIADO', 'CONFIRMADO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE']

const ORDER_FILTERS: Array<{ label: string; value: 'ALL' | OrderStatus }> = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Novo', value: 'CRIADO' },
  { label: 'Em preparo', value: 'EM_PREPARO' },
  { label: 'Saiu pra entrega', value: 'SAIU_PARA_ENTREGA' },
  { label: 'Entregue', value: 'ENTREGUE' },
]

function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = STATUS_FLOW.indexOf(status)
  return index < STATUS_FLOW.length - 1 ? STATUS_FLOW[index + 1] : null
}

export default function CompanyPage() {
  const { logout } = useAuth()

  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders')

  const [orders, setOrders] = useState(mockOrders)
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL')

  const [menuItems, setMenuItems] = useState(mockMenuItems)
  const [editingItem, setEditingItem] = useState<MenuItem | 'new' | null>(null)
  const [ingredientLibrary, setIngredientLibrary] = useState(mockIngredients)
  const [categoryLibrary, setCategoryLibrary] = useState(mockCategories)

  const filteredOrders = orders
    .filter((order) => statusFilter === 'ALL' || order.status === statusFilter)
    .sort((a, b) => a.placedMinutesAgo - b.placedMinutesAgo)

  function handleAdvanceOrder(orderId: string) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus(order.status) ?? order.status } : order
      )
    )
  }

  function handleToggleAvailable(itemId: string) {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, available: !item.available } : item))
    )
  }

  function handleAddCategory(name: string): Category {
    const existing = categoryLibrary.find((category) => category.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing

    const category: Category = { id: crypto.randomUUID(), name }
    setCategoryLibrary((prev) => [...prev, category])
    return category
  }

  function handleAddIngredient(name: string): Ingredient {
    const existing = ingredientLibrary.find((ingredient) => ingredient.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing

    const ingredient: Ingredient = { id: crypto.randomUUID(), name }
    setIngredientLibrary((prev) => [...prev, ingredient])
    return ingredient
  }

  function handleSaveItem(data: Omit<MenuItem, 'id' | 'available'>) {
    if (editingItem && editingItem !== 'new') {
      setMenuItems((prev) => prev.map((item) => (item.id === editingItem.id ? { ...item, ...data } : item)))
    } else {
      setMenuItems((prev) => [...prev, { ...data, id: crypto.randomUUID(), available: true }])
    }
    setEditingItem(null)
  }

  return (
    <PageContainer>
      <TopBar
        title="Painel do parceiro"
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
        <div className="sticky top-14 z-30 -mx-4 mb-3 bg-gray-50 px-4 pt-1 pb-2">
          <div className="flex h-11 items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex-1 rounded-lg py-1.5 text-sm transition-colors ${
                activeTab === 'orders' ? 'bg-brand font-bold text-white' : 'font-semibold text-gray-500'
              }`}
            >
              Pedidos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex-1 rounded-lg py-1.5 text-sm transition-colors ${
                activeTab === 'menu' ? 'bg-brand font-bold text-white' : 'font-semibold text-gray-500'
              }`}
            >
              Cardápio
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ORDER_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`min-h-[36px] flex-none rounded-full px-3.5 text-sm font-semibold transition-colors ${
                    statusFilter === filter.value ? 'bg-brand text-white' : 'bg-white text-gray-500 border border-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center pt-10">Nenhum pedido nesse status.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    canAdvance={nextStatus(order.status) !== null}
                    onAdvance={() => handleAdvanceOrder(order.id)}
                    onOpenChat={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {menuItems.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                onClick={() => setEditingItem(item)}
                onToggleAvailable={() => handleToggleAvailable(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {activeTab === 'menu' && (
        <button
          type="button"
          onClick={() => setEditingItem('new')}
          aria-label="Adicionar produto"
          className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-3xl leading-none text-white shadow-lg"
        >
          +
        </button>
      )}

      <BottomSheet
        open={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title={editingItem === 'new' ? 'Novo produto' : 'Editar produto'}
      >
        <MenuItemForm
          initialItem={editingItem && editingItem !== 'new' ? editingItem : undefined}
          categoryLibrary={categoryLibrary}
          onAddCategory={handleAddCategory}
          ingredientLibrary={ingredientLibrary}
          onAddIngredient={handleAddIngredient}
          onSubmit={handleSaveItem}
          onCancel={() => setEditingItem(null)}
        />
      </BottomSheet>
    </PageContainer>
  )
}
