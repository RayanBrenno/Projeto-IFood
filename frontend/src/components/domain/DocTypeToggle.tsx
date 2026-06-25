interface DocTypeToggleProps {
  value: 'CNPJ' | 'CPF'
  onChange: (value: 'CNPJ' | 'CPF') => void
}

export function DocTypeToggle({ value, onChange }: DocTypeToggleProps) {
  const options: Array<'CNPJ' | 'CPF'> = ['CNPJ', 'CPF']

  return (
    <div className="flex h-11 items-center gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1">
      {options.map((option) => {
        const active = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`flex-1 rounded-lg py-1.5 text-sm transition-colors ${
              active ? 'bg-white font-bold text-ink shadow-sm' : 'font-semibold text-gray-500'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
