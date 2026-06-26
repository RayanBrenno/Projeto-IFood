import type { OrderStatus } from '../../types/company'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  CRIADO: { label: 'Novo', className: 'bg-gray-100 text-gray-600' },
  CONFIRMADO: { label: 'Confirmado', className: 'bg-sky-100 text-sky-600' },
  EM_PREPARO: { label: 'Em preparo', className: 'bg-orange-100 text-orange-600' },
  SAIU_PARA_ENTREGA: { label: 'Saiu para entrega', className: 'bg-brand/10 text-brand' },
  ENTREGUE: { label: 'Entregue', className: 'bg-success/10 text-success' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = STATUS_CONFIG[status]

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
