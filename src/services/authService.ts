import type { LoginCredentials, AuthResponse, User } from '../types/auth'
import { post, get } from './apiClient'

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
    const token = localStorage.getItem('auth_token')
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
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('auth_user')
  
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
  localStorage.setItem('auth_token', token)
  localStorage.setItem('auth_user', JSON.stringify(user))
}

export const clearAuth = (): void => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}
