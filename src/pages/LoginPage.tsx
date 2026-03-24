import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/atoms'
import { login, setAuth } from '../services/authService'
import type { LoginCredentials } from '../types/auth'

interface FormErrors {
  username?: string
  password?: string
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!credentials.username.trim()) {
      newErrors.username = 'El usuario es requerido'
    }

    if (!credentials.password) {
      newErrors.password = 'La contraseña es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')

    if (!validate()) return

    setIsLoading(true)

    try {
      const response = await login(credentials)

      if (response.success && response.user && response.token) {
        setAuth(response.user, response.token)
        navigate('/admin')
      } else {
        setServerError(response.error || 'Error al iniciar sesión')
      }
    } catch {
      setServerError('Error de conexión. Intenta más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div 
        className="w-full max-w-md p-8 rounded-xl"
        style={{ 
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)'
        }}
      >
        <div className="text-center mb-8">
          <h1 
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--text-h)', fontFamily: 'var(--font-heading)' }}
          >
            Golden Tool
          </h1>
          <p style={{ color: 'var(--text)' }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && (
            <div 
              className="p-3 rounded-lg text-sm"
              style={{ 
                background: 'var(--danger-50)', 
                color: 'var(--danger-600)',
                border: '1px solid var(--danger-200)'
              }}
            >
              {serverError}
            </div>
          )}

          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-h)' }}
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={credentials.username}
              onChange={handleChange('username')}
              className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
              style={{ 
                background: 'var(--bg)',
                borderColor: errors.username ? 'var(--danger-500)' : 'var(--border)',
                color: 'var(--text-h)',
                '--tw-ring-color': 'var(--accent-border)'
              } as React.CSSProperties}
              placeholder="admin"
            />
            {errors.username && (
              <p className="mt-1 text-sm" style={{ color: 'var(--danger-600)' }}>
                {errors.username}
              </p>
            )}
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-h)' }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={handleChange('password')}
              className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
              style={{ 
                background: 'var(--bg)',
                borderColor: errors.password ? 'var(--danger-500)' : 'var(--border)',
                color: 'var(--text-h)',
                '--tw-ring-color': 'var(--accent-border)'
              } as React.CSSProperties}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm" style={{ color: 'var(--danger-600)' }}>
                {errors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Iniciar Sesión
          </Button>
        </form>

        <div 
          className="mt-6 p-3 rounded-lg text-sm"
          style={{ 
            background: 'var(--accent-bg)', 
            border: '1px solid var(--accent-border)'
          }}
        >
          <p style={{ color: 'var(--text)' }}>
            <strong>Usuario de prueba:</strong> admin<br />
            <strong>Contraseña:</strong> password123
          </p>
        </div>
      </div>
    </div>
  )
}
