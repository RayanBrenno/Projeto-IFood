export type AccountType = 'CLIENTE' | 'RESTAURANTE'

export interface User {
  id: string
  username: string
  email: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  account_type: AccountType
  user: User
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
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
