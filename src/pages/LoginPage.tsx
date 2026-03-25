import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parse } from 'valibot'
import { Button, Input } from '../components/atoms'
import { FormField } from '../components/molecules'
import { useAuthStore } from '../stores/authStore'
import { emailSchema, passwordSchema } from '../schemas/authSchema'

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

  const [credentials, setCredentials] = useState<LoginFormData>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    try { parse(emailSchema, credentials.email) } catch (e) {
      newErrors.email = (e as Error).message
    }
    try { parse(passwordSchema, credentials.password) } catch (e) {
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
    if (success) navigate('/admin')
  }

  const handleChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="min-h-screen flex text-left">

      {/* ── Panel izquierdo — marca ── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-center gap-14 p-16 bg-surface-950 select-none">

        {/* Wordmark */}
        <div>
          <p
            className="text-[3.75rem] font-black m-0 leading-none"
            style={{
              letterSpacing: '-0.05em',
              background: 'linear-gradient(125deg, #ffffff 20%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            GoldenTool
          </p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-surface-600 mt-2.5 m-0">
            Sistema de Gestión
          </p>
        </div>

        {/* Tagline */}
        <p
          className="text-[2.25rem] font-semibold text-surface-300 leading-snug m-0"
          style={{ letterSpacing: '-0.03em' }}
        >
          Herramientas,<br />
          inventario<br />
          y revisiones.
        </p>

        {/* Empresa */}
        <p className="text-xs text-surface-600 m-0">
          Transmisiones Automáticas Golden Gate
        </p>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-16 bg-white">
        <div className="w-full max-w-[380px]">

          {/* Wordmark mobile */}
          <div className="lg:hidden mb-12">
            <p className="text-[2.6rem] font-black m-0 leading-none" style={{ letterSpacing: '-0.045em' }}>
              <span className="text-surface-900">Golden</span>
              <span className="text-primary-600">Tool</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-surface-400 mt-2.5 m-0">
              Sistema de Gestión
            </p>
          </div>

          {/* Encabezado */}
          <div className="mb-10">
            <h2
              className="text-[2.25rem] font-semibold text-surface-900 m-0"
              style={{ letterSpacing: '-0.04em' }}
            >
              Iniciar sesión
            </h2>
            <p className="text-base text-surface-400 mt-2 m-0">
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3">
                <p className="text-sm text-danger-700 m-0">{error}</p>
              </div>
            )}

            <FormField label="Correo electrónico" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={handleChange('email')}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                error={!!errors.email}
              />
            </FormField>

            <FormField label="Contraseña" htmlFor="password" error={errors.password}>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                autoComplete="current-password"
                error={!!errors.password}
              />
            </FormField>

            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Ingresar
              </Button>
            </div>
          </form>

          <p className="mt-10 text-xs text-surface-400 m-0">
            Transmisiones Automáticas Golden Gate
          </p>
        </div>
      </div>
    </div>
  )
}
