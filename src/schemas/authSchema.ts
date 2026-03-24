import { pipe, string, minLength, maxLength } from 'valibot'

export const usernameSchema = pipe(
  string(),
  minLength(1, 'Username is required'),
  maxLength(50, 'Username must be less than 50 characters')
)

export const passwordSchema = pipe(
  string(),
  minLength(1, 'Password is required'),
  minLength(6, 'Password must be at least 6 characters')
)

export type LoginFormData = { username: string; password: string }