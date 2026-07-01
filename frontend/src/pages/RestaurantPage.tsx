import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BottomSheet } from '../components/layout/BottomSheet'
import { PageContainer } from '../components/layout/PageContainer'
import { TopBar } from '../components/layout/TopBar'
import { Button } from '../components/ui/Button'
import { PublicMenuItemRow } from '../components/domain/PublicMenuItemRow'
import { useRestaurantMenu } from '../hooks/useRestaurantMenu'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/orders'
import { formatCurrency } from '../utils/formatCurrency'
import { getApiErrorMessage } from '../utils/apiError'
import type { MenuItem } from '../types/company'

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { categories, menuItems, loading, error, reload } = useRestaurantMenu(id ?? '')
  const { companyId, items: cartItems, total, addItem, clearCart } = useCart()

  const [sizePicker, setSizePicker] = useState<MenuItem | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const cartForThisRestaurant = companyId === id
  const cartCount = cartForThisRestaurant ? cartItems.reduce((n, i) => n + i.quantity, 0) : 0
  const cartTotal = cartForThisRestaurant ? total : 0

  const itemsByCategory = categories.map((category) => ({
    category,
    items: menuItems.filter((item) => item.categoryId === category.id),
  }))

  function handleAddItem(item: MenuItem) {
    if (!id) return
    if (item.kind === 'COM_TAMANHOS') {
      setSizePicker(item)
    } else {
      addItem(id, item, 1, undefined, undefined, item.price)
    }
  }

  function handlePickSize(item: MenuItem, sizeId: string, sizeLabel: string, price: number) {
    if (!id) return
    addItem(id, item, 1, sizeId, sizeLabel, price)
    setSizePicker(null)
  }

  async function handleConfirmOrder() {
    if (!id || cartItems.length === 0) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const order = await createOrder({
        company_id: id,
        items: cartItems.map((i) => ({
          menu_item_id: i.menuItem.id,
          quantity: i.quantity,
          size_id: i.sizeId,
        })),
        notes: notes.trim() || undefined,
      })
      clearCart()
      setCheckoutOpen(false)
      setNotes('')
      navigate(`/orders/${order.id}`)
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Não foi possível fazer o pedido.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer className={cartCount > 0 ? 'pb-24' : ''}>
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
                      <PublicMenuItemRow
                        key={item.id}
                        item={item}
                        onAdd={item.available ? () => handleAddItem(item) : undefined}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 bg-white border-t border-gray-100 shadow-lg">
          <Button onClick={() => setCheckoutOpen(true)} className="w-full">
            {cartCount} {cartCount === 1 ? 'item' : 'itens'} · {formatCurrency(cartTotal)} — Ver carrinho
          </Button>
        </div>
      )}

      <BottomSheet
        open={sizePicker !== null}
        onClose={() => setSizePicker(null)}
        title={sizePicker?.name ?? 'Escolha o tamanho'}
      >
        <div className="flex flex-col gap-2">
          {sizePicker?.sizes?.map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => sizePicker && handlePickSize(sizePicker, size.id, size.label, size.price)}
              className="flex items-center justify-between min-h-[52px] rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-ink hover:border-brand hover:bg-brand/5 transition-colors"
            >
              <span>{size.label}</span>
              <span className="text-brand">{formatCurrency(size.price)}</span>
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Confirmar pedido">
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {cartItems.map((i) => (
              <li key={i.menuItem.id + (i.sizeId ?? '')} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  {i.quantity}x {i.menuItem.name}
                  {i.sizeLabel && <span className="text-gray-400"> ({i.sizeLabel})</span>}
                </span>
                <span className="font-semibold text-ink">{formatCurrency(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="font-semibold text-ink">Total</span>
            <span className="font-bold text-ink">{formatCurrency(cartTotal)}</span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações (sem cebola, endereço de entrega…)"
            maxLength={300}
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-base text-ink placeholder:text-gray-400 focus:border-brand focus:outline-none"
          />

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}

          <Button onClick={handleConfirmOrder} loading={submitting} className="w-full">
            Fazer pedido
          </Button>
        </div>
      </BottomSheet>
    </PageContainer>
  )
}
