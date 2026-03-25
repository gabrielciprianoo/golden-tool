import { pipe, string, minLength, maxLength, email } from 'valibot'

export const emailSchema = pipe(
  string(),
  minLength(1, 'El email es obligatorio'),
  maxLength(100, 'El email es demasiado largo'),
  email('Email inválido')
)

export const passwordSchema = pipe(
  string(),
  minLength(1, 'La contraseña es obligatoria'),
  minLength(6, 'La contraseña debe tener al menos 6 caracteres')
)

export type LoginFormData = { email: string; password: string }