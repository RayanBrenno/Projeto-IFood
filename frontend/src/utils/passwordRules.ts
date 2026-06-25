export interface PasswordRule {
  id: string
  label: string
  test: (password: string) => boolean
}

export const passwordRules: PasswordRule[] = [
  { id: 'length', label: 'No mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { id: 'uppercase', label: '1 letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: '1 número', test: (p) => /\d/.test(p) },
]

export function isPasswordValid(password: string): boolean {
  return passwordRules.every((rule) => rule.test(password))
}
