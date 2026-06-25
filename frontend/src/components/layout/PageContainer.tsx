import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className={`min-h-screen pb-20 pt-14 px-4 bg-gray-50 ${className}`}>
      {children}
    </main>
  )
}
