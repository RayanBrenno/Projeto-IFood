import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  title: string
  back?: boolean
  actions?: ReactNode
  large?: boolean
}

export function TopBar({ title, back, actions, large }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 z-50 ${
        large ? 'lg:h-20 lg:px-6' : ''
      }`}
    >
      {back && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
        >
          ←
        </button>
      )}
      <h1 className={`font-semibold text-base flex-1 text-center ${large ? 'lg:text-lg' : ''}`}>{title}</h1>
      {actions}
    </header>
  )
}
