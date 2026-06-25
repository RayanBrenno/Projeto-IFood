import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { PasswordChecklist } from '../components/domain/PasswordChecklist'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../utils/apiError'
import { isPasswordValid } from '../utils/passwordRules'

export default function RegisterUserPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [error, setError] = useState('')

  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!isPasswordValid(password)) {
      setError('A senha ainda não atende aos requisitos mínimos.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    try {
      await register({ username, email, password })
      navigate('/')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível criar sua conta. Tente novamente.'))
    }
  }

  return (
    <AuthLayout
      eyebrow="Seu próximo pedido começa aqui"
      heroTitle={
        <>
          Junte-se ao
          <br />
          Fooomé.
        </>
      }
      heroSubtitle="Crie sua conta em segundos e ganhe frete grátis no primeiro pedido."
    >
      <div className="lg:hidden grid grid-cols-[44px_1fr_44px] items-center mb-6">
        <Link
          to="/login"
          aria-label="Voltar para o login"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-gray-500 text-2xl"
        >
          ←
        </Link>
        <h2 className="font-display font-semibold text-2xl text-ink text-center">
          Crie sua conta
        </h2>
        <span />
      </div>

      <p className="hidden lg:block text-base font-bold tracking-wide text-brand">COMECE AGORA</p>
      <h2 className="hidden lg:block font-display font-semibold text-[40px] text-ink mb-2 mt-2">
        Crie sua conta
      </h2>
      <p className="hidden lg:block text-lg text-gray-500 mb-8">É rápido e gratuito.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome de usuário"
          name="username"
          autoComplete="username"
          pattern="^[a-zA-Z0-9_]+$"
          minLength={3}
          maxLength={30}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setPasswordFocused(true)}
          hint={
            (passwordFocused || password.length > 0) && (
              <PasswordChecklist password={password} />
            )
          }
          required
        />

        <PasswordInput
          label="Confirmar senha"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          hint={
            confirmPassword.length > 0 && (
              <span
                className={`text-xs flex items-center gap-1.5 mt-1 transition-colors ${
                  passwordsMatch ? 'text-success' : 'text-red-500'
                }`}
              >
                <span>{passwordsMatch ? '✓' : '○'}</span>
                {passwordsMatch ? 'As senhas coincidem' : 'As senhas ainda não coincidem'}
              </span>
            )
          }
          required
        />

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Button type="submit" loading={loading} className="mt-2 w-full">
          Criar conta
        </Button>

        <p className="text-sm text-gray-500 text-center mt-1">
          Já tem conta?{' '}
          <Link to="/login" className="text-brand font-semibold">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
