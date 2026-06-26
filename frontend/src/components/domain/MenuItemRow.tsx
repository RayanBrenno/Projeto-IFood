import type { MenuItem } from '../../types/company'
import { formatCurrency } from '../../utils/formatCurrency'

interface MenuItemRowProps {
  item: MenuItem
  onClick: () => void
  onToggleAvailable: () => void
}

function displayPrice(item: MenuItem): string {
  if (item.kind === 'COM_TAMANHOS') {
    const prices = (item.sizes ?? []).map((size) => size.price)
    if (prices.length === 0) return formatCurrency(0)
    return `A partir de ${formatCurrency(Math.min(...prices))}`
  }
  return formatCurrency(item.price ?? 0)
}

export function MenuItemRow({ item, onClick, onToggleAvailable }: MenuItemRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 shadow-sm">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 items-center gap-3 min-h-[44px] text-left"
      >
        <div className="h-12 w-12 flex-none rounded-lg bg-gray-100 object-cover" aria-hidden />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-ink">{item.name}</span>
          <span className="text-sm text-gray-500">{displayPrice(item)}</span>
        </div>
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={item.available}
        aria-label={item.available ? 'Marcar como esgotado' : 'Marcar como disponível'}
        onClick={onToggleAvailable}
        className={`relative h-7 w-12 flex-none rounded-full transition-colors ${
          item.available ? 'bg-success' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            item.available ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
