import { useState, type FormEvent } from 'react'
import type { Category, Ingredient, MenuItem, MenuItemKind, MenuItemPayload, MenuItemSize } from '../../types/company'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

const KIND_OPTIONS: Array<{ value: MenuItemKind; label: string }> = [
  { value: 'SIMPLES', label: 'Simples' },
  { value: 'COM_TAMANHOS', label: 'Com tamanhos/tipos' },
  { value: 'UNITARIO_COM_INGREDIENTES', label: 'Ingredientes removíveis' },
]

function defaultSizes(): MenuItemSize[] {
  return [
    { id: crypto.randomUUID(), label: 'Pequena', price: 0 },
    { id: crypto.randomUUID(), label: 'Média', price: 0 },
    { id: crypto.randomUUID(), label: 'Grande', price: 0 },
  ]
}

interface MenuItemFormProps {
  initialItem?: MenuItem
  categoryLibrary: Category[]
  onAddCategory: (name: string) => Promise<Category>
  ingredientLibrary: Ingredient[]
  onAddIngredient: (name: string) => Promise<Ingredient>
  onSubmit: (data: MenuItemPayload) => Promise<void>
  onCancel: () => void
}

export function MenuItemForm({
  initialItem,
  categoryLibrary,
  onAddCategory,
  ingredientLibrary,
  onAddIngredient,
  onSubmit,
  onCancel,
}: MenuItemFormProps) {
  const [kind, setKind] = useState<MenuItemKind>(initialItem?.kind ?? 'SIMPLES')
  const [name, setName] = useState(initialItem?.name ?? '')
  const [description, setDescription] = useState(initialItem?.description ?? '')
  const [categoryId, setCategoryId] = useState(initialItem?.categoryId ?? categoryLibrary[0]?.id ?? '')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [price, setPrice] = useState(initialItem?.price !== undefined ? String(initialItem.price) : '')
  const [sizes, setSizes] = useState<MenuItemSize[]>(initialItem?.sizes ?? [])
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    initialItem?.removableIngredientIds ?? []
  )
  const [newIngredientName, setNewIngredientName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleKindChange(nextKind: MenuItemKind) {
    setKind(nextKind)
    if (nextKind === 'COM_TAMANHOS' && sizes.length === 0) {
      setSizes(defaultSizes())
    }
  }

  function updateSize(id: string, field: 'label' | 'price', value: string) {
    setSizes((prev) =>
      prev.map((size) =>
        size.id === id ? { ...size, [field]: field === 'price' ? Number(value.replace(',', '.')) || 0 : value } : size
      )
    )
  }

  function removeSize(id: string) {
    setSizes((prev) => prev.filter((size) => size.id !== id))
  }

  function addSize() {
    setSizes((prev) => [...prev, { id: crypto.randomUUID(), label: '', price: 0 }])
  }

  function toggleIngredient(id: string) {
    setSelectedIngredientIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleAddIngredient() {
    const trimmed = newIngredientName.trim()
    if (!trimmed) return
    const ingredient = await onAddIngredient(trimmed)
    setSelectedIngredientIds((prev) => (prev.includes(ingredient.id) ? prev : [...prev, ingredient.id]))
    setNewIngredientName('')
  }

  async function handleAddCategory() {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    const newCategory = await onAddCategory(trimmed)
    setCategoryId(newCategory.id)
    setNewCategoryName('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const base = { name, description, categoryId, kind }

    setIsSubmitting(true)
    try {
      if (kind === 'COM_TAMANHOS') {
        await onSubmit({ ...base, sizes: sizes.map(({ label, price }) => ({ label, price })) })
      } else if (kind === 'UNITARIO_COM_INGREDIENTES') {
        await onSubmit({
          ...base,
          price: Number(price.replace(',', '.')) || 0,
          removableIngredientIds: selectedIngredientIds,
        })
      } else {
        await onSubmit({ ...base, price: Number(price.replace(',', '.')) || 0 })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <button
        type="button"
        className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 text-sm text-gray-400"
      >
        Adicionar foto (em breve)
      </button>

      <div className="flex h-11 items-center gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1">
        {KIND_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleKindChange(option.value)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
              kind === option.value ? 'bg-white text-ink shadow-sm' : 'text-gray-500'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Input label="Nome do produto" name="name" value={name} onChange={(e) => setName(e.target.value)} required />

      <Input
        label="Descrição"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      {kind === 'COM_TAMANHOS' ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink">Tamanhos</span>
          {sizes.map((size) => (
            <div key={size.id} className="flex items-end gap-2">
              <Input
                label=""
                name={`size-label-${size.id}`}
                placeholder="Nome (ex: Pequena)"
                value={size.label}
                onChange={(e) => updateSize(size.id, 'label', e.target.value)}
                className="flex-1"
              />
              <Input
                label=""
                name={`size-price-${size.id}`}
                inputMode="decimal"
                placeholder="0,00"
                value={String(size.price)}
                onChange={(e) => updateSize(size.id, 'price', e.target.value)}
                className="w-24"
              />
              <button
                type="button"
                onClick={() => removeSize(size.id)}
                aria-label="Remover tamanho"
                className="min-h-[44px] min-w-[44px] flex flex-none items-center justify-center text-gray-400"
              >
                ×
              </button>
            </div>
          ))}
          <Button type="button" variant="ghost" onClick={addSize} className="self-start">
            + Adicionar tamanho
          </Button>
        </div>
      ) : (
        <Input
          label="Preço"
          name="price"
          inputMode="decimal"
          placeholder="0,00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">Categoria</span>
        <div className="flex flex-wrap gap-2">
          {categoryLibrary.map((option) => {
            const selected = categoryId === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setCategoryId(option.id)}
                className={`min-h-[36px] rounded-full px-3.5 text-sm font-semibold transition-colors ${
                  selected ? 'bg-brand text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {option.name}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <Input
            label=""
            name="newCategory"
            placeholder="Nova seção (ex: Pizza Doce)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={handleAddCategory}>
            Adicionar
          </Button>
        </div>
      </div>

      {kind === 'UNITARIO_COM_INGREDIENTES' && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink">Ingredientes removíveis</span>
          <div className="flex flex-wrap gap-2">
            {ingredientLibrary.map((ingredient) => {
              const checked = selectedIngredientIds.includes(ingredient.id)
              return (
                <button
                  key={ingredient.id}
                  type="button"
                  onClick={() => toggleIngredient(ingredient.id)}
                  className={`min-h-[36px] rounded-full px-3.5 text-sm font-semibold transition-colors ${
                    checked ? 'bg-brand text-white' : 'bg-white text-gray-500 border border-gray-200'
                  }`}
                >
                  {ingredient.name}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <Input
              label=""
              name="newIngredient"
              placeholder="Novo ingrediente"
              value={newIngredientName}
              onChange={(e) => setNewIngredientName(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="secondary" onClick={handleAddIngredient}>
              Adicionar
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" loading={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
