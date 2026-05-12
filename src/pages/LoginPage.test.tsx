import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginPage } from './LoginPage'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}))

vi.mock('../schemas/authSchema', () => ({
  emailSchema: {},
  passwordSchema: {},
}))

describe('LoginPage', () => {
  it('debe renderizar correctamente', () => {
    render(<LoginPage />)
    expect(document.body).toBeInTheDocument()
  })

  it('debe tener formulario de login', () => {
    render(<LoginPage />)
    expect(screen.getByText(/Iniciar sesión/)).toBeInTheDocument()
  })
})