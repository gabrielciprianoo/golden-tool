import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

vi.mock('../services/authService', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUserFromApi: vi.fn(),
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  it('debe tener estado inicial sin autenticación', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('debe limpiar el error', () => {
    useAuthStore.setState({ error: 'Error de prueba' })
    const { clearError } = useAuthStore.getState()
    clearError()
    expect(useAuthStore.getState().error).toBeNull()
  })

  it('debe tener las funciones definidas', () => {
    const state = useAuthStore.getState()
    expect(state.login).toBeDefined()
    expect(state.logout).toBeDefined()
    expect(state.verifyAuth).toBeDefined()
    expect(state.clearError).toBeDefined()
  })
})