import { api } from './axios'
import type { AuthResponse, CompanyRegisterPayload, LoginPayload, RegisterPayload } from '../types/user'

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function registerCompanyRequest(payload: CompanyRegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register/company', payload)
  return data
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}
