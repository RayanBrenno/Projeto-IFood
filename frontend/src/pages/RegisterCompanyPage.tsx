import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { PasswordInput } from '../components/ui/PasswordInput'
import { DocTypeToggle } from '../components/domain/DocTypeToggle'
import { PasswordChecklist } from '../components/domain/PasswordChecklist'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../utils/apiError'
import { isPasswordValid } from '../utils/passwordRules'

const CATEGORIES = [
  'Restaurante',
  'Lanchonete',
  'Padaria',
  'Mercado',
  'Farmácia',
  'Bebidas',
  'Doces & Sobremesas',
  'Outros',
]

const BENEFITS = [
  'Sem mensalidade nos primeiros 30 dias',
  'Receba os pagamentos em 1 dia útil',
  'Painel de gestão completo',
]

function ProgressBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="h-1.5 flex-1 rounded-full bg-brand" />
      <div className={`h-1.5 flex-1 rounded-full ${step === 2 ? 'bg-brand' : 'bg-gray-200'}`} />
      <span className="whitespace-nowrap text-xs font-bold text-gray-500">{step} de 2</span>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return <div className="text-xs font-bold uppercase tracking-wide text-gray-400">{children}</div>
}

export default function RegisterCompanyPage() {
  const { registerCompany, loading } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2>(1)
  const [businessName, setBusinessName] = useState('')
  const [documentType, setDocumentType] = useState<'CNPJ' | 'CPF'>('CNPJ')
  const [documentNumber, setDocumentNumber] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])

  const [responsibleName, setResponsibleName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [error, setError] = useState('')

  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password
  const documentMaxLength = documentType === 'CNPJ' ? 18 : 14

  function handleContinue(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!businessName || !documentNumber || !category) {
      setError('Preencha todos os campos para continuar.')
      return
    }

    setStep(2)
  }

  async function submitRegistration() {
    setError('')

    if (!businessName || !documentNumber || !category) {
      setError('Preencha os dados do negócio.')
      return
    }
    if (!isPasswordValid(password)) {
      setError('A senha ainda não atende aos requisitos mínimos.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (!termsAccepted) {
      setError('Você precisa aceitar os Termos de Parceria para continuar.')
      return
    }

    try {
      await registerCompany({
        business_name: businessName,
        document_type: documentType,
        document_number: documentNumber,
        category,
        responsible_name: responsibleName,
        phone,
        email,
        password,
      })
      navigate('/company')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível criar sua conta de parceiro. Tente novamente.'))
    }
  }

  function handleSubmitStep2(event: FormEvent) {
    event.preventDefault()
    submitRegistration()
  }

  function handleSubmitDesktop(event: FormEvent) {
    event.preventDefault()
    submitRegistration()
  }

  function renderDocumentField(idPrefix: string) {
    return (
      <Input
        label={documentType}
        name={`${idPrefix}-documentNumber`}
        placeholder={documentType === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
        maxLength={documentMaxLength}
        value={documentNumber}
        onChange={(e) => setDocumentNumber(e.target.value)}
        required
      />
    )
  }

  function renderCategoryField(idPrefix: string) {
    const fieldId = `${idPrefix}-category`
    return <Select id={fieldId} label="Categoria" value={category} options={CATEGORIES} onChange={setCategory} />
  }

  function renderPasswordField(idPrefix: string) {
    return (
      <PasswordInput
        label="Senha"
        name={`${idPrefix}-password`}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={() => setPasswordFocused(true)}
        hint={(passwordFocused || password.length > 0) && <PasswordChecklist password={password} />}
        required
      />
    )
  }

  function renderConfirmPasswordField(idPrefix: string) {
    return (
      <PasswordInput
        label="Confirmar senha"
        name={`${idPrefix}-confirmPassword`}
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
    )
  }

  function renderTermsField(idPrefix: string) {
    const fieldId = `${idPrefix}-terms`
    return (
      <label htmlFor={fieldId} className="flex cursor-pointer items-start gap-3 mt-1">
        <input
          id={fieldId}
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 h-5 w-5 flex-none rounded-md border-gray-300 text-brand focus:ring-brand"
        />
        <span className="text-xs leading-relaxed text-gray-500">
          Li e aceito os <span className="font-semibold text-brand">Termos de Parceria</span> e a{' '}
          <span className="font-semibold text-brand">Política de Privacidade</span>.
        </span>
      </label>
    )
  }

  return (
    <AuthLayout
      eyebrow="Venda mais, com a gente"
      badge="PARCEIROS"
      heroTitle="Faça seu negócio crescer."
      heroSubtitle="Milhares de clientes com fome esperando por você. Cadastre seu estabelecimento e comece a vender hoje."
      benefits={BENEFITS}
      wide
    >
      {/* ─────────────── MOBILE: wizard de 2 passos ─────────────── */}
      <div className="lg:hidden">
        <div className="grid grid-cols-[44px_1fr_44px] items-center mb-4">
          {step === 1 ? (
            <Link
              to="/login"
              aria-label="Voltar para o login"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-gray-500 text-2xl"
            >
              ←
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setStep(1)}
              aria-label="Voltar para o passo anterior"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-gray-500 text-2xl"
            >
              ←
            </button>
          )}
          <h2 className="font-display font-semibold text-2xl text-ink text-center">Cadastro de parceiro</h2>
          <span />
        </div>

        <ProgressBar step={step} />

        {step === 1 ? (
          <form onSubmit={handleContinue} className="flex flex-col gap-4">
            <h3 className="font-display font-semibold text-lg text-ink">Sobre o seu negócio</h3>

            <Input
              label="Nome do estabelecimento"
              name="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">Tipo de cadastro</span>
              <DocTypeToggle value={documentType} onChange={setDocumentType} />
            </div>

            {renderDocumentField('mobile')}
            {renderCategoryField('mobile')}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="mt-2 w-full">
              Continuar
            </Button>

            <p className="text-sm text-gray-500 text-center mt-1">
              Já é parceiro?{' '}
              <Link to="/login" className="text-brand font-semibold">
                Entrar
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmitStep2} className="flex flex-col gap-4">
            <h3 className="font-display font-semibold text-lg text-ink">Responsável &amp; acesso</h3>

            <Input
              label="Nome do responsável"
              name="responsibleName"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              required
            />

            <Input
              label="Telefone / WhatsApp"
              type="tel"
              name="phone"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

            {renderPasswordField('mobile')}
            {renderConfirmPasswordField('mobile')}
            {renderTermsField('mobile')}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" loading={loading} className="mt-2 w-full">
              Criar conta de parceiro
            </Button>

            <p className="text-sm text-gray-500 text-center mt-1">
              Já é parceiro?{' '}
              <Link to="/login" className="text-brand font-semibold">
                Entrar
              </Link>
            </p>
          </form>
        )}
      </div>

      {/* ─────────────── DESKTOP: página única, coluna central ─────────────── */}
      <div className="hidden lg:block">
        <p className="text-base font-bold tracking-wide text-brand">SEJA UM PARCEIRO</p>
        <h2 className="font-display font-semibold text-[40px] text-ink mb-8 mt-2">Cadastre seu negócio</h2>

        <form onSubmit={handleSubmitDesktop} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <SectionLabel>Sobre o negócio</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nome do estabelecimento"
                name="businessNameDesktop"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
              {renderCategoryField('desktop')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink">Tipo</span>
                <DocTypeToggle value={documentType} onChange={setDocumentType} />
              </div>
              {renderDocumentField('desktop')}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <SectionLabel>Responsável</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nome do responsável"
                name="responsibleNameDesktop"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                required
              />
              <Input
                label="Telefone / WhatsApp"
                type="tel"
                name="phoneDesktop"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <SectionLabel>Acesso</SectionLabel>
            <Input
              label="E-mail"
              type="email"
              name="emailDesktop"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {renderPasswordField('desktop')}
            {renderConfirmPasswordField('desktop')}
            {renderTermsField('desktop')}
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" loading={loading} className="w-full !h-14 !text-base">
            Cadastrar negócio
          </Button>

          <p className="text-sm text-gray-500 text-center -mt-2">
            Já é parceiro?{' '}
            <Link to="/login" className="text-brand font-semibold">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
