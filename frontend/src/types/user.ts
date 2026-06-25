export type UserRole = 'CLIENTE' | 'RESTAURANTE' | 'ADMIN'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  role?: UserRole
}

export interface LoginPayload {
  identifier: string
  password: string
}

export interface CompanyRegisterPayload {
  business_name: string
  document_type: 'CNPJ' | 'CPF'
  document_number: string
  category: string
  responsible_name: string
  phone: string
  email: string
  password: string
}
