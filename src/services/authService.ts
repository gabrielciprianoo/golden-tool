import type { LoginCredentials, AuthResponse, User } from '../types/auth'

const MOCK_USER: User = {
  id: '1',
  username: 'admin',
  email: 'admin@goldentool.com',
  name: 'Administrador'
}

const MOCK_TOKEN = 'mock-jwt-token-123456789'

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500))

  if (credentials.username === 'admin' && credentials.password === 'password123') {
    return {
      success: true,
      user: MOCK_USER,
      token: MOCK_TOKEN
    }
  }

  return {
    success: false,
    error: 'Usuario o contraseña incorrectos'
  }
}

export const logout = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200))
}

export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('auth_user')
  
  if (token && user) {
    return JSON.parse(user)
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
