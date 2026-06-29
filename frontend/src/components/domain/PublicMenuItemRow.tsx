import type { MenuItem } from '../../types/company'
import { formatCurrency } from '../../utils/formatCurrency'

interface PublicMenuItemRowProps {
  item: MenuItem
}

function displayPrice(item: MenuItem): string {
  if (item.kind === 'COM_TAMANHOS') {
    const prices = (item.sizes ?? []).map((size) => size.price)
    if (prices.length === 0) return formatCurrency(0)
    return `A partir de ${formatCurrency(Math.min(...prices))}`
  }
  return formatCurrency(item.price ?? 0)
}

export function PublicMenuItemRow({ item }: PublicMenuItemRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 shadow-sm ${
        item.available ? '' : 'opacity-50'
      }`}
    >
      <div className="h-12 w-12 flex-none rounded-lg bg-gray-100" aria-hidden />
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{item.name}</span>
          {!item.available && (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">
              Esgotado
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">{item.description}</span>
        <span className="text-sm font-medium text-ink">{displayPrice(item)}</span>
      </div>
    </div>
  )
}
