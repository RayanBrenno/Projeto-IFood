import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageContainer } from '../components/layout/PageContainer'
import { TopBar } from '../components/layout/TopBar'
import { fetchMyOrder } from '../api/orders'
import { formatCurrency } from '../utils/formatCurrency'
import type { CustomerOrder, OrderStatus } from '../types/company'

const STEPS: Array<{ status: OrderStatus; label: string }> = [
  { status: 'CRIADO', label: 'Pedido recebido' },
  { status: 'CONFIRMADO', label: 'Confirmado' },
  { status: 'EM_PREPARO', label: 'Em preparo' },
  { status: 'SAIU_PARA_ENTREGA', label: 'Saiu pra entrega' },
  { status: 'ENTREGUE', label: 'Entregue' },
]

function stepIndex(status: OrderStatus): number {
  return STEPS.findIndex((s) => s.status === status)
}

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<CustomerOrder | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function load() {
      try {
        const data = await fetchMyOrder(id!)
        setOrder(data)
      } catch {
        setError('Pedido não encontrado.')
      }
    }

    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [id])

  const isCancelled = order?.status === 'CANCELADO'
  const currentStep = order ? stepIndex(order.status) : -1

  return (
    <PageContainer>
      <TopBar title="Acompanhar pedido" back />

      <div className="lg:w-4/5 lg:mx-auto pt-4">
        {error ? (
          <p className="text-sm text-gray-400 text-center pt-10">{error}</p>
        ) : !order ? (
          <p className="text-sm text-gray-400 text-center pt-10">Carregando…</p>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{order.companyName}</p>
              <p className="font-display font-semibold text-ink text-lg">
                {formatCurrency(order.total)}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">{order.timeLabel}</p>
            </div>

            {isCancelled ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
                <p className="font-semibold text-red-600">Pedido cancelado</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <ol className="flex flex-col gap-4">
                  {STEPS.map((step, idx) => {
                    const done = idx <= currentStep
                    const active = idx === currentStep
                    return (
                      <li key={step.status} className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold transition-colors ${
                            done
                              ? 'bg-brand text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {done && idx < currentStep ? '✓' : idx + 1}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            active ? 'text-brand' : done ? 'text-ink' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Itens</p>
              <ul className="flex flex-col gap-1.5">
                {order.items.map((item) => (
                  <li key={item.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.quantity}x {item.name}</span>
                  </li>
                ))}
              </ul>
              {order.notes && (
                <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Obs.</p>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
