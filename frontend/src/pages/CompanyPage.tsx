import { useCallback, useEffect, useState } from 'react'
import { BottomSheet } from '../components/layout/BottomSheet'
import { PageContainer } from '../components/layout/PageContainer'
import { TopBar } from '../components/layout/TopBar'
import { Button } from '../components/ui/Button'
import { MenuItemForm } from '../components/domain/MenuItemForm'
import { MenuItemRow } from '../components/domain/MenuItemRow'
import { OrderCard } from '../components/domain/OrderCard'
import type { MenuItem, MenuItemPayload, Order, OrderStatus } from '../types/company'
import { useAuth } from '../hooks/useAuth'
import { useMenu } from '../hooks/useMenu'
import { fetchRestaurantOrders, updateOrderStatus } from '../api/orders'
import { getApiErrorMessage } from '../utils/apiError'

const stripeBg = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(255,255,255,.08) 0 16px, rgba(255,255,255,0) 16px 34px)',
}

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
  return index !== -1 && index < STATUS_FLOW.length - 1 ? STATUS_FLOW[index + 1] : null
}

export default function CompanyPage() {
  const { logout } = useAuth()

  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders')

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL')

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      const data = await fetchRestaurantOrders()
      setOrders(data)
    } catch (err) {
      setOrdersError(getApiErrorMessage(err, 'Não foi possível carregar os pedidos.'))
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 15000)
    return () => clearInterval(interval)
  }, [loadOrders])

  const {
    categories,
    ingredients,
    menuItems,
    loading: menuLoading,
    error: menuError,
    addCategory,
    addIngredient,
    saveItem,
    toggleAvailable,
    reload: reloadMenu,
  } = useMenu()
  const [editingItem, setEditingItem] = useState<MenuItem | 'new' | null>(null)
  const [formSessionId, setFormSessionId] = useState(0)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)

  function openItemForm(item: MenuItem | 'new') {
    setSaveError(null)
    setFormSessionId((id) => id + 1)
    setEditingItem(item)
  }

  const filteredOrders = orders
    .filter((order) => statusFilter === 'ALL' || order.status === statusFilter)
    .sort((a, b) => a.placedMinutesAgo - b.placedMinutesAgo)

  async function handleAdvanceOrder(orderId: string, currentStatus: OrderStatus) {
    const next = nextStatus(currentStatus)
    if (!next) return
    try {
      const updated = await updateOrderStatus(orderId, next)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    } catch {
      // reload to sync state on failure
      loadOrders()
    }
  }

  async function handleToggleAvailable(itemId: string) {
    setToggleError(null)
    try {
      await toggleAvailable(itemId)
    } catch (err) {
      setToggleError(getApiErrorMessage(err, 'Não foi possível atualizar a disponibilidade.'))
    }
  }

  async function handleSaveItem(data: MenuItemPayload) {
    setSaveError(null)
    try {
      await saveItem(data, editingItem && editingItem !== 'new' ? editingItem.id : undefined)
      setEditingItem(null)
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'Não foi possível salvar o produto.'))
    }
  }

  return (
    <PageContainer className="lg:bg-transparent lg:pt-20">
      <div
        className="hidden lg:block fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#3a57f0] to-[#2233c4] pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0" style={stripeBg} />
      </div>

      <TopBar
        title="Painel do parceiro"
        large
        actions={
          <Button onClick={logout} className="lg:min-h-[40px] lg:px-4">
            Sair
          </Button>
        }
      />

      <div className="lg:w-4/5 lg:mx-auto">
      <div className="relative z-10 lg:mx-6 lg:my-6 lg:rounded-3xl lg:border lg:border-white lg:bg-gray-50 lg:px-6 lg:pb-6 lg:pt-4 lg:shadow-xl">
        <div className="sticky top-14 z-30 -mx-4 mb-3 bg-gray-50 px-4 pt-1 pb-2 lg:mx-0 lg:px-0 lg:pt-0">
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

            {ordersLoading ? (
              <p className="text-sm text-gray-400 text-center pt-10">Carregando pedidos…</p>
            ) : ordersError ? (
              <div className="flex flex-col items-center gap-3 pt-10">
                <p className="text-sm text-gray-400 text-center">{ordersError}</p>
                <button
                  type="button"
                  onClick={loadOrders}
                  className="min-h-[44px] rounded-full bg-brand px-4 text-sm font-semibold text-white"
                >
                  Tentar novamente
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center pt-10">Nenhum pedido nesse status.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    canAdvance={nextStatus(order.status) !== null}
                    onAdvance={() => handleAdvanceOrder(order.id, order.status)}
                    onOpenChat={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {menuLoading ? (
              <p className="text-sm text-gray-400 text-center pt-10">Carregando cardápio…</p>
            ) : menuError ? (
              <div className="flex flex-col items-center gap-3 pt-10">
                <p className="text-sm text-gray-400 text-center">{menuError}</p>
                <button
                  type="button"
                  onClick={reloadMenu}
                  className="min-h-[44px] rounded-full bg-brand px-4 text-sm font-semibold text-white"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
                {toggleError && <p className="text-sm text-red-500">{toggleError}</p>}
                {menuItems.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onClick={() => openItemForm(item)}
                    onToggleAvailable={() => handleToggleAvailable(item.id)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
      </div>

      {activeTab === 'menu' && (
        <button
          type="button"
          onClick={() => openItemForm('new')}
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
        {saveError && <p className="mb-3 text-sm text-red-500">{saveError}</p>}
        <MenuItemForm
          key={formSessionId}
          initialItem={editingItem && editingItem !== 'new' ? editingItem : undefined}
          categoryLibrary={categories}
          onAddCategory={addCategory}
          ingredientLibrary={ingredients}
          onAddIngredient={addIngredient}
          onSubmit={handleSaveItem}
          onCancel={() => setEditingItem(null)}
        />
      </BottomSheet>
    </PageContainer>
  )
}
