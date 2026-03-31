export const workerValidationRules = {
  name: {
    required: 'El nombre es requerido',
    minLength: 'El nombre debe tener al menos 2 caracteres',
    maxLength: 'El nombre no puede exceder 50 caracteres',
    pattern: 'Solo se permiten letras y espacios',
  },
  lastName: {
    required: 'Los apellidos son requeridos',
    minLength: 'Los apellidos deben tener al menos 2 caracteres',
    maxLength: 'Los apellidos no pueden exceder 100 caracteres',
    pattern: 'Solo se permiten letras y espacios',
  },
  area: {
    required: 'Selecciona un área',
  },
}

export const validateField = (field: 'name' | 'lastName', value: string): string | undefined => {
  const rules = field === 'name' ? workerValidationRules.name : workerValidationRules.lastName
  
  if (!value.trim()) return rules.required
  if (value.trim().length < 2) return rules.minLength
  if (value.length > (field === 'name' ? 50 : 100)) return rules.maxLength
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return rules.pattern
  
  return undefined
}

export type WorkerFormData = {
  name: string
  lastName: string
  area: 'montaje/desmontaje' | 'armado/desarmado'
}
