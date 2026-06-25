import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  eyebrow: string
  heroTitle: ReactNode
  heroSubtitle: string
  badge?: string
  benefits?: string[]
  wide?: boolean
}

const stripeBg = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(255,255,255,.08) 0 16px, rgba(255,255,255,0) 16px 34px)',
}

export function AuthLayout({ children, eyebrow, heroTitle, heroSubtitle, badge, benefits, wide }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* faixa azul mobile */}
      <div className="lg:hidden relative w-full overflow-hidden bg-gradient-to-b from-[#3a57f0] to-[#2233c4] pt-10 pb-24 px-4 flex flex-col items-center gap-1">
        <div className="absolute inset-0" style={stripeBg} />
        <span className="relative font-display font-bold text-5xl text-white tracking-tight">
          Fooom<span className="text-[#bcd0ff]">é</span>
        </span>
        <span className="relative text-sm text-white/80">{eyebrow}</span>
      </div>

      {/* hero lateral desktop */}
      <div className="hidden lg:flex relative w-2/5 flex-col justify-between overflow-hidden bg-gradient-to-b from-[#3a57f0] to-[#2233c4] p-14">
        <div className="absolute inset-0" style={stripeBg} />
        <div className="relative flex items-center gap-3">
          <span className="font-display text-3xl font-bold tracking-tight text-white">
            Fooom<span className="text-[#bcd0ff]">é</span>
          </span>
          {badge && (
            <span className="rounded-md border border-white/40 px-[7px] py-[3px] font-sans text-xs font-bold uppercase tracking-wide text-white/80">
              {badge}
            </span>
          )}
        </div>
        <div className="relative">
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-[380px] text-lg leading-relaxed text-white/80">{heroSubtitle}</p>
          {benefits && (
            <div className="mt-7 flex flex-col gap-3.5">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-base text-white">
                  <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-white/20 text-[13px]">
                    ✓
                  </span>
                  {benefit}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="relative" />
      </div>

      {/* painel do formulário */}
      <div className="relative z-10 w-full lg:w-3/5 flex flex-col items-center lg:justify-center">
        <div
          className={`w-full max-w-sm px-4 -mt-12 lg:mt-0 lg:px-14 lg:py-14 ${
            wide ? 'lg:max-w-[640px]' : 'lg:max-w-[520px]'
          }`}
        >
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-black/10 px-6 pb-8 pt-6 lg:border-0 lg:shadow-none lg:rounded-none lg:px-0 lg:pb-0 lg:pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
