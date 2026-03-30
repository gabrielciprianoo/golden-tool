export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  username: string
  email: string
  name: string
  role: 'admin' | 'worker'
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}
