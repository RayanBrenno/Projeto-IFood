import { PageContainer } from '../components/layout/PageContainer'
import { TopBar } from '../components/layout/TopBar'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <PageContainer>
      <TopBar title="Fooomé" />

      <div className="flex flex-col items-center gap-3 pt-10 text-center">
        <h2 className="font-display font-semibold text-xl text-ink">Olá, @{user?.username}!</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <Button variant="secondary" onClick={logout} className="mt-4">
          Sair
        </Button>
      </div>
    </PageContainer>
  )
}
