import { useEffect, useRef, useState } from 'react'

interface SelectProps {
  id: string
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

export function Select({ id, label, value, options, onChange }: SelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((prev) => !prev)}
        className="min-h-[44px] flex items-center justify-between text-base px-3.5 rounded-xl border border-gray-200 bg-white text-left text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow"
      >
        <span>{value}</span>
        <span className="text-gray-400 text-xs">▾</span>
      </button>
      {open && (
        <ul className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg z-20">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
                className={`w-full text-left px-3.5 py-2.5 text-sm hover:bg-gray-50 ${
                  option === value ? 'font-semibold text-brand' : 'text-ink'
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
