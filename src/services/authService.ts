import type { LoginCredentials, AuthResponse, User } from '../types/auth'
import { post, get } from './apiClient'

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await post<{ user: User }>('/login', credentials)

  if (response.success && response.data) {
    return {
      success: true,
      user: response.data.user,
    }
  }

  const errorMessage = 'error' in response ? response.error : 'Usuario o contraseña incorrectos'
  return {
    success: false,
    error: errorMessage,
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

  const errorMessage = 'error' in response ? response.error : 'No se pudo obtener el usuario'
  return {
    success: false,
    error: errorMessage,
  }
}
