import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export function Button({ children, variant = 'primary', loading, className = '', ...props }: ButtonProps) {
  const base =
    'min-h-[44px] px-4 py-2 rounded-full font-semibold font-sans transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    secondary: 'bg-gray-100 text-ink hover:bg-gray-200',
    ghost: 'text-brand hover:bg-brand/5',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      )}
      {children}
    </button>
  )
}
