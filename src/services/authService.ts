import axios from 'axios'
import type { LoginCredentials, AuthResponse, User } from '../types/auth'
import { post, get } from './apiClient'

const SANCTUM_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? ''

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  await axios.get(`${SANCTUM_URL}/sanctum/csrf-cookie`, { withCredentials: true })

  const response = await post<{ user: User }>('/login', credentials)

  if (response.success && response.data) {
    return {
      success: true,
      user: response.data.user,
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
