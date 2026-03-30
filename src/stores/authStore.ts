import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/auth'
import { login as authLogin, logout as authLogout, getCurrentUserFromApi } from '../services/authService'
import type { LoginCredentials } from '../types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  verifyAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
  set({ isLoading: true, error: null })

  try {
    const response = await authLogin(credentials)

    if (response.success && response.token && response.user) {
      const { token, user } = response

      localStorage.setItem('token', token)

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      })

      return true
    } else {
      set({
        error: response.error || 'Credenciales incorrectas',
        isLoading: false,
      })
      return false
    }
  } catch {
    set({
      error: 'Error de conexión. Intenta de nuevo.',
      isLoading: false,
    })
    return false
  }
},

      logout: async () => {
        await authLogout()
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })
      },

      verifyAuth: async () => {
        if (!get().isAuthenticated) return
        const response = await getCurrentUserFromApi()
        if (response.success && response.user) {
          set({ user: response.user })
        } else {
          set({ user: null, isAuthenticated: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
