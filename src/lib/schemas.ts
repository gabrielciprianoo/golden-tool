import { object, string, optional } from 'valibot'

export const loginSchema = object({
  email: string(),
  password: string(),
})

export const registerSchema = object({
  name: string(),
  email: string(),
  password: string(),
})

export const updateUserSchema = object({
  name: optional(string()),
  email: optional(string()),
})

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
}
