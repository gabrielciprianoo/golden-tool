import type { LoginCredentials, AuthResponse, User } from '../types/auth'
import { post, get } from './apiClient'

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

function setCookie(name: string, value: string, days?: number): void {
  const expires = days ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}` : ''
  document.cookie = `${name}=${value}${expires}; path=/`
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await post<{ user: User; token: string }>('api/login', credentials)
  
  if (response.success && response.data) {
    return {
      success: true,
      user: response.data.user,
      token: response.data.token
    }
  }

  const errorMessage = 'error' in response ? response.error : 'Usuario o contraseña incorrectos'
  return {
    success: false,
    error: errorMessage
  }
}

export const logout = async (): Promise<void> => {
  await post('/logout')
}

export const getCurrentUserFromApi = async (): Promise<AuthResponse> => {
  const response = await get<{ user: User }>('/me')
  
  if (response.success && response.data) {
    const token = getCookie('auth_token')
    return {
      success: true,
      user: response.data.user,
      token: token || undefined
    }
  }

  const errorMessage = 'error' in response ? response.error : 'No se pudo obtener el usuario'
  return {
    success: false,
    error: errorMessage
  }
}

export const getCurrentUser = (): User | null => {
  const token = getCookie('auth_token')
  const user = getCookie('auth_user')
  
  if (token && user) {
    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  }
  return null
}

export const setAuth = (user: User, token: string): void => {
  setCookie('auth_token', token)
  setCookie('auth_user', JSON.stringify(user))
}

export const clearAuth = (): void => {
  deleteCookie('auth_token')
  deleteCookie('auth_user')
}
