import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parse } from 'valibot'
import { Button } from '../components/atoms'
import { useAuthStore } from '../stores/authStore'
import { passwordSchema } from '../schemas/authSchema'

interface FormErrors {
  email?: string
  password?: string
}

interface LoginFormData {
  email: string
  password: string
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  
  const [credentials, setCredentials] = useState<LoginFormData>({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!credentials.email) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email inválido'
    }

    try {
      parse(passwordSchema, credentials.password)
    } catch (e) {
      newErrors.password = (e as Error).message
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validate()) return

    const success = await login(credentials)
    if (success) {
      navigate('/admin')
    }
  }

  const handleChange = (field: keyof LoginFormData) => (
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
            Introduce tus credenciales para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div 
              className="p-3 rounded-lg text-sm"
              style={{ 
                background: 'var(--danger-50)', 
                color: 'var(--danger-600)',
                border: '1px solid var(--danger-200)'
              }}
            >
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-h)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={credentials.email}
              onChange={handleChange('email')}
              className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
              style={{ 
                background: 'var(--bg)',
                borderColor: errors.email ? 'var(--danger-500)' : 'var(--border)',
                color: 'var(--text-h)',
                '--tw-ring-color': 'var(--accent-border)'
              } as React.CSSProperties}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm" style={{ color: 'var(--danger-600)' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-h)' }}
            >
              Password
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
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}