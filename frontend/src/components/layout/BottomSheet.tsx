import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity lg:flex lg:items-center lg:justify-center ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-8 transition-transform ${
          open ? 'translate-y-0' : 'translate-y-full'
        } lg:static lg:mx-auto lg:w-4/5 lg:max-h-[80vh] lg:translate-y-0 lg:rounded-2xl lg:p-6`}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 lg:hidden" />
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg text-ink flex-1 text-center lg:text-left">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="hidden lg:flex h-8 w-8 flex-none items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
