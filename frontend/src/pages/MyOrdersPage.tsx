import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '../components/layout/PageContainer'
import { TopBar } from '../components/layout/TopBar'
import { OrderStatusBadge } from '../components/domain/OrderStatusBadge'
import { fetchMyOrders } from '../api/orders'
import { formatCurrency } from '../utils/formatCurrency'
import type { CustomerOrder } from '../types/company'

const PAGE_SIZE = 5

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch(() => setError('Não foi possível carregar seus pedidos.'))
      .finally(() => setLoading(false))
  }, [])

  const shown = orders.slice(0, visible)
  const hasMore = visible < orders.length

  return (
    <PageContainer>
      <TopBar title="Meus pedidos" back />

      <div className="lg:w-4/5 lg:mx-auto pt-3">
        {loading ? (
          <p className="text-sm text-gray-400 text-center pt-10">Carregando…</p>
        ) : error ? (
          <p className="text-sm text-gray-400 text-center pt-10">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center pt-10">Você ainda não fez nenhum pedido.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-ink">{order.companyName}</span>
                    <span className="text-xs text-gray-400">{order.timeLabel}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-none">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm font-semibold text-ink">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 truncate">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
              </Link>
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="min-h-[44px] rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Ver mais ({orders.length - visible} restantes)
              </button>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
