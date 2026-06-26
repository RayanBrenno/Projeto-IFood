import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: ReactNode
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`min-h-[44px] text-base px-3.5 rounded-xl border bg-white ${
          error ? 'border-red-400' : 'border-gray-200'
        } focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow ${className}`}
        {...props}
      />
      {hint}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
