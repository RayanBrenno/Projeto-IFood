import type { Order } from '../../types/company'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../ui/Button'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderCardProps {
  order: Order
  canAdvance: boolean
  onAdvance: () => void
  onOpenChat: () => void
}

export function OrderCard({ order, canAdvance, onAdvance, onOpenChat }: OrderCardProps) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-ink">{order.customerName}</span>
          <span className="text-xs text-gray-400">{order.timeLabel}</span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <OrderStatusBadge status={order.status} />
          <span className="text-sm font-semibold text-ink">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-1">
        {order.items.map((item) => (
          <li key={item.name} className="text-sm text-gray-600">
            {item.quantity}x {item.name}
          </li>
        ))}
      </ul>

      <div className="rounded-lg bg-gray-50 px-3 py-2">
        <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Observações</span>
        <p className="text-sm text-gray-600">{order.notes || 'Sem observações'}</p>
      </div>

      <div className="mt-auto flex items-center gap-3 pt-1">
        {canAdvance ? (
          <Button onClick={onAdvance} className="flex-1">
            Avançar pedido
          </Button>
        ) : (
          <span className="flex-1 text-center text-sm font-semibold text-success">Pedido entregue</span>
        )}

        <button
          type="button"
          onClick={onOpenChat}
          aria-label="Conversar com o cliente"
          title="Chat com o cliente (em breve)"
          className="min-h-[44px] min-w-[44px] flex flex-none items-center justify-center rounded-full border border-gray-200 text-gray-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
