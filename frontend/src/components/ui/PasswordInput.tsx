import { useState, type InputHTMLAttributes, type ReactNode } from 'react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  hint?: ReactNode
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7-10.5-7-10.5-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.36 5.6A10.6 10.6 0 0 1 12 5c6.5 0 10.5 7 10.5 7a13.2 13.2 0 0 1-2.6 3.4M6.6 6.6C3.4 8.7 1.5 12 1.5 12s1.6 2.8 4.5 4.9c1.5 1.1 3.4 1.9 6 1.9 1 0 1.9-.1 2.7-.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PasswordInput({ label, error, hint, id, className = '', ...props }: PasswordInputProps) {
  const inputId = id ?? props.name
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`min-h-[44px] w-full text-base px-3.5 pr-11 rounded-xl border bg-white ${
            error ? 'border-red-400' : 'border-gray-200'
          } focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
