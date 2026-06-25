import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  title: string
  back?: boolean
  actions?: ReactNode
}

export function TopBar({ title, back, actions }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 z-50">
      {back && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
        >
          ←
        </button>
      )}
      <h1 className="font-semibold text-base flex-1 text-center">{title}</h1>
      {actions}
    </header>
  )
}
