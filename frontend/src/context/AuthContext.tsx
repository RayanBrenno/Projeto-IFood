import { createContext, useState, type ReactNode } from 'react'
import { loginRequest, registerCompanyRequest, registerRequest } from '../api/auth'
import type { AuthResponse, CompanyRegisterPayload, LoginPayload, RegisterPayload, User } from '../types/user'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<AuthResponse>
  register: (payload: RegisterPayload) => Promise<AuthResponse>
  registerCompany: (payload: CompanyRegisterPayload) => Promise<AuthResponse>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function loadStoredUser(): User | null {
  const stored = localStorage.getItem('user')
  return stored ? (JSON.parse(stored) as User) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser)
  const [loading, setLoading] = useState(false)

  function persistSession(token: string, loggedUser: User) {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user', JSON.stringify(loggedUser))
    setUser(loggedUser)
  }

  async function login(payload: LoginPayload) {
    setLoading(true)
    try {
      const data = await loginRequest(payload)
      persistSession(data.access_token, data.user)
      return data
    } finally {
      setLoading(false)
    }
  }

  async function register(payload: RegisterPayload) {
    setLoading(true)
    try {
      const data = await registerRequest(payload)
      persistSession(data.access_token, data.user)
      return data
    } finally {
      setLoading(false)
    }
  }

  async function registerCompany(payload: CompanyRegisterPayload) {
    setLoading(true)
    try {
      const data = await registerCompanyRequest(payload)
      persistSession(data.access_token, data.user)
      return data
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerCompany, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
