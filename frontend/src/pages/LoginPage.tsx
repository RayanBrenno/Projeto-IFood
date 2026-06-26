import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../utils/apiError'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    try {
      const data = await login({ email, password })
      navigate(data.account_type === 'RESTAURANTE' ? '/company' : '/')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível entrar. Tente novamente.'))
    }
  }

  return (
    <AuthLayout
      eyebrow="Fome? A gente entrega."
      heroTitle={
        <>
          Comida boa,
          <br />
          sem complicação.
        </>
      }
      heroSubtitle="Seus restaurantes favoritos, entrega rápida e tudo em poucos cliques."
    >
      <p className="hidden lg:block text-base font-bold tracking-wide text-brand">BEM-VINDO DE VOLTA</p>
      <h2 className="font-display font-semibold text-2xl lg:text-[40px] text-ink text-center lg:text-left mb-6 lg:mb-2 lg:mt-2">
        Entrar na sua conta
      </h2>
      <p className="hidden lg:block text-lg text-gray-500 mb-8">Use seu e-mail e senha para continuar.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordInput
          label="Senha"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Button type="submit" loading={loading} className="mt-2 w-full">
          Entrar
        </Button>

        <p className="text-sm text-gray-500 text-center mt-1">
          Não tem conta?{' '}
          <Link to="/register" className="text-brand font-semibold">
            Cadastre-se
          </Link>
        </p>
        <p className="text-sm text-gray-500 text-center">
          Deseja se tornar parceiro?{' '}
          <Link to="/register/company" className="text-brand font-semibold">
            Cadastre seu negócio
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
