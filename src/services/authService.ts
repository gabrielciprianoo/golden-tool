import type { LoginCredentials, AuthResponse, User } from '../types/auth'
import { post, get } from './apiClient'

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await post<{ user: User; token: string }>('/login', credentials)

  if (response.success && response.data) {
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    }
  }

  return {
    success: false,
    error: 'Usuario o contraseña incorrectos',
  }
}

export const logout = async (): Promise<void> => {
  await post('/logout')
}

export const getCurrentUserFromApi = async (): Promise<AuthResponse> => {
  const response = await get<User>('/me')

  if (response.success && response.data) {
    return {
      success: true,
      user: response.data,
    }
  }

  return {
    success: false,
    error: 'No se pudo obtener el usuario',
  }
}